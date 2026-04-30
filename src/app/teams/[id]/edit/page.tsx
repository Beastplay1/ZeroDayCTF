"use client";
import { useEffect, useState, use } from "react";
import { Card, CardBody, Input, Button, Spacer } from "@heroui/react";
import { Orbitron } from "next/font/google";
import { useRouter } from "next/navigation";

const orbitron = Orbitron({ subsets: ["latin"] });

export default function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const teamId = unwrappedParams.id;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`/api/teams/${teamId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.team) {
          router.push("/teams");
          return;
        }
        setName(data.team.name);
        setTag(data.team.tag);
        setDescription(data.team.description || "");
        setAvatarUrl(data.team.avatarUrl || "");
        setLoading(false);
      })
      .catch(() => {
        router.push("/teams");
      });
  }, [teamId, router]);

  const handleAvatarUpload = async () => {
    if (!file) return avatarUrl;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/teams/${teamId}/avatar`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to upload avatar");
    return data.avatarUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let finalAvatarUrl = avatarUrl;
      if (file) {
        finalAvatarUrl = await handleAvatarUpload();
        setAvatarUrl(finalAvatarUrl);
      }

      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tag,
          description,
          avatarUrl: finalAvatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update team");
      }

      setSuccess("Team updated successfully!");
      setTimeout(() => router.push(`/teams/${teamId}`), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white font-mono">Loading...</div>;

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <Card className="bg-[#0f0f0f] border-2 border-zerogreen/30">
          <CardBody className="p-8">
            <h1 className={`${orbitron.className} text-2xl font-bold text-white mb-6`}>
              Edit Team
            </h1>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  maxLength={32}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-gray-700 text-white px-4 py-2 font-mono focus:border-zerogreen outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-400 mb-1">Team Tag</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={tag}
                  onChange={(e) => setTag(e.target.value.toUpperCase())}
                  className="w-full bg-black border border-gray-700 text-white px-4 py-2 font-mono focus:border-zerogreen outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-400 mb-1">Description</label>
                <textarea
                  maxLength={100}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black border border-gray-700 text-white px-4 py-2 font-mono focus:border-zerogreen outline-none resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-lg font-mono text-gray-300 mb-4">Team Avatar</label>
                <div className="flex items-center gap-6 bg-black/40 p-6 rounded-xl border border-gray-800">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Team Avatar" referrerPolicy="no-referrer" className="w-19 h-19 sm:w-19 sm:h-19 rounded object-cover border-4 border-zerogreen" />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded bg-gray-900 flex items-center justify-center border-4 border-dashed border-gray-600 text-3xl">
                      {name[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="text-base text-gray-400 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-base file:font-semibold file:bg-zerogreen/20 file:text-zerogreen hover:file:bg-zerogreen/30 cursor-pointer"
                    />
                    <p className="text-base text-gray-500 font-mono ml-2">PNG, JPG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {error && <div className="text-red-500 font-mono text-sm">{error}</div>}
              {success && <div className="text-zerogreen font-mono text-sm">{success}</div>}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-grow bg-zerogreen text-black font-bold font-mono"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  as="a"
                  href={`/teams/${teamId}`}
                  variant="bordered"
                  className="border-gray-700 text-gray-400 font-mono"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
