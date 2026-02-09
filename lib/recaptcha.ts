export async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
     // If no secret key is provided in dev, maybe skip? 
     // For security, we should fail or warn. 
     // For now, let's log and fail if missing in production, but maybe allow bypass in dev if really needed? 
     // No, let's just fail to ensure it's set up.
     console.error('RECAPTCHA_SECRET_KEY is not defined');
     return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    
    // v3 returns a score (0.0 to 1.0). You can check data.score if you want stricter control.
    // data.success is true if the token is valid.
    return data.success && data.score >= 0.5; // Threshold can be adjusted
  } catch (error) {
    console.error('Recaptcha verification error:', error);
    return false;
  }
}
