// app/admin/RequestList.tsx
'use client';

import { useState } from 'react';
import { Loader2, Check, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface RequestItem {
  id: string;
  type: string;
  payload: string;
  originalTerm: string | null;
  status: string;
  user: {
      email: string;
      name: string | null;
  };
  createdAt: string;
}

export default function RequestList({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
        const res = await fetch(`/api/admin/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId: id })
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed');
        
        if (action === 'approve') {
            toast.success("Request approved and PR created!");
        } else {
            toast.success("Request rejected.");
        }

        // Remove from list
        setRequests(prev => prev.filter(r => r.id !== id));

    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setProcessingId(null);
    }
  };

  if (requests.length === 0) {
      return <div className="text-muted-foreground">No pending requests.</div>;
  }

  return (
    <div className="space-y-4">
      {requests.map(req => {
        const payload = JSON.parse(req.payload);
        const original = req.originalTerm ? JSON.parse(req.originalTerm) : null;
        
        return (
          <div key={req.id} className="border p-4 rounded-md bg-background flex flex-col gap-3">
             <div className="flex justify-between items-start">
                 <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mr-2 ${req.type === 'ADD' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {req.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        Requested by {req.user.email} on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                 </div>
             </div>

             <div className="grid md:grid-cols-2 gap-4 text-sm mt-2">
                 {original && (
                    <div className="bg-muted/50 p-3 rounded">
                        <h4 className="font-semibold text-muted-foreground mb-2">Original</h4>
                        <pre className="whitespace-pre-wrap font-sans text-xs">
                           Category: {original.Category} <br/>
                           English: {original['Full Form (English)']} <br/>
                           Chinese: {original.Chinese} <br/>
                           Desc: {original.Description}
                        </pre>
                    </div>
                 )}
                 <div className={`${!original ? 'col-span-2' : ''} bg-muted/20 border p-3 rounded`}>
                    <h4 className="font-semibold text-primary mb-2">New Content</h4>
                     <pre className="whitespace-pre-wrap font-sans text-xs">
                           Category: {payload.Category} <br/>
                           English: {payload['Full Form (English)']} <br/>
                           Chinese: {payload.Chinese} <br/>
                           Desc: {payload.Description}
                    </pre>
                 </div>
             </div>

             <div className="flex justify-end gap-2 mt-2">
                 <button 
                   onClick={() => handleAction(req.id, 'reject')}
                   disabled={!!processingId}
                   className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border rounded hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                 >
                   <X className="h-4 w-4" /> Reject
                 </button>
                 <button 
                    onClick={() => handleAction(req.id, 'approve')}
                    disabled={!!processingId}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                 >
                    {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Approve & PR
                 </button>
             </div>
          </div>
        );
      })}
    </div>
  );
}
