"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import API_BASE from "@/lib/api";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  aiResponse?: string;
  createdAt?: string;
}

export default function ContactAdmin() {
  const [queries, setQueries] = useState<ContactMessage[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/contact/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setQueries(d.messages);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Contact Queries</h1>
      {queries.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-muted-foreground">No queries yet.</CardContent>
        </Card>
      ) : (
        queries.map((q) => (
          <Card key={q._id}>
            <CardHeader>
              <CardTitle>
                {q.name} ({q.email})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Message:</strong> {q.message}
              </p>
              <p>
                <strong>AI Reply:</strong> {q.aiResponse || "Pending"}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

