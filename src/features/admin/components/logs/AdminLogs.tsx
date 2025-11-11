import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AdminLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllLogs({
        limit: 100,
        type: type === "all" ? undefined : type,
      });
      let data = res.logs || [];
      if (query.trim()) {
        const q = query.toLowerCase();
        data = data.filter(
          (l: any) =>
            l.type?.toLowerCase().includes(q) ||
            JSON.stringify(l.metadata || {})
              .toLowerCase()
              .includes(q) ||
            (l.user_id || "").toLowerCase().includes(q)
        );
      }
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
        <CardDescription>All users’ activities with filters</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search in type, metadata or user id..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="login">login</SelectItem>
              <SelectItem value="subscription_create">
                subscription_create
              </SelectItem>
              <SelectItem value="subscription_activated">
                subscription_activated
              </SelectItem>
              <SelectItem value="subscription_cancel">
                subscription_cancel
              </SelectItem>
              <SelectItem value="payment_succeeded">
                payment_succeeded
              </SelectItem>
              <SelectItem value="subscription_refund">
                subscription_refund
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>

        <div className="rounded-lg border border-border">
          <div className="px-3 py-2 text-xs font-medium grid grid-cols-12 gap-3 border-b border-border text-muted-foreground">
            <div className="col-span-3">User</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-5">Metadata</div>
            <div className="col-span-2 text-right">Time</div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No logs</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="p-3 text-xs grid grid-cols-12 gap-3">
                  <div className="col-span-3 font-medium break-words">
                    <div className="truncate">
                      {log.users?.name || "Unknown"}{" "}
                      <span className="text-muted-foreground">
                        ({log.user_id})
                      </span>
                    </div>
                    <div className="text-muted-foreground truncate">
                      {log.users?.email || "—"}
                    </div>
                  </div>
                  <div className="col-span-2">{log.type}</div>
                  <div className="col-span-5 text-muted-foreground break-words">
                    {JSON.stringify(log.metadata || {})}
                  </div>
                  <div className="col-span-2 text-right text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
