import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

interface AddKeyResponse {
  success?: boolean;
  error?: string;
}

export function AddKeyForm() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddKey = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = (await res.json()) as AddKeyResponse;

      console.log(data);

      if (data.success) {
        toast.success("Thành công! 🎉", {
          description: "Key đã được thêm vào pool.",
          className: "bg-green-500 text-white",
        });
        setKey("");
      } else {
        toast.error("Lỗi rồi bro ơi", {
          description: data.error,
        });
      }
    } catch (e) {
      toast.warning("Lỗi mạng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Manage Keys</CardTitle>
        <CardDescription>Thêm key Google AI Studio vào pool.</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Input
          placeholder="AIzaSy..."
          value={key}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setKey(e.target.value)
          }
          className="font-mono"
        />
        <Button onClick={() => void handleAddKey()} disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </Button>
      </CardContent>
    </Card>
  );
}
