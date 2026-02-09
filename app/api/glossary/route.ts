// app/api/glossary/route.ts
import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import Papa from 'papaparse';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const PATH = process.env.CSV_PATH!;
const BRANCH = process.env.GITHUB_BRANCH || 'main';

// GET: 获取并解析 CSV
export async function GET() {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      ref: BRANCH,
    });

    if (!('content' in data)) throw new Error("No content found");

    // GitHub 返回的是 Base64，需要解码
    const csvContent = Buffer.from(data.content, 'base64').toString('utf-8');
    
    // 解析 CSV
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    return NextResponse.json({ 
      data: parsed.data, 
      sha: data.sha // 需要 SHA 来进行后续的更新操作
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST: 保存更新回 CSV
export async function POST(request: Request) {
  try {
    const { newContent, sha, message } = await request.json();

    // 将 JSON 转回 CSV 字符串
    const csvString = Papa.unparse(newContent);
    const contentEncoded = Buffer.from(csvString).toString('base64');

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      message: message || 'Update glossary via Web',
      content: contentEncoded,
      sha: sha, // 必须提供 SHA 以验证我们在修改最新版本
      branch: BRANCH,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}