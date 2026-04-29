"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, Input, Button, Spacer } from "@heroui/react";
import { Orbitron } from "next/font/google";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

const orbitron = Orbitron({ subsets: ["latin"] });

export default function EditProfilePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/signin");
          return;
        }
        setUsername(data.username ? data.username.split("#")[0] : "");
        setEmail(data.email || "");
        setOriginalEmail(data.email || "");
        setAvatarUrl(data.avatarUrl || "");
        setLoading(false);
      })
      .catch(() => {
        router.push("/signin");
      });
  }, [router]);

  const handleAvatarUpload = async () => {
    if (!file) return avatarUrl;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t("profileEdit.failAvatar"));
    return data.avatarUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (newPassword && newPassword !== confirmPassword) {
        throw new Error(t("profileEdit.pwNotMatch"));
      }

      let finalAvatarUrl = avatarUrl;
      if (file) {
        finalAvatarUrl = await handleAvatarUpload();
        setAvatarUrl(finalAvatarUrl);
      }

      const payload = {
        username,
        email,
        avatarUrl: finalAvatarUrl,
        ...(oldPassword ? { oldPassword } : {}),
        ...(newPassword ? { newPassword } : {}),
      };

      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("profileEdit.failUpdate"));
      }

      if (data.loggedOut) {
        setSuccess(t("profileEdit.updateLogout"));
        setTimeout(() => router.push("/signin"), 2000);
      } else {
        setSuccess(t("profileEdit.updateSuccess"));
        setOriginalEmail(email);
        setOldPassword("");
        setNewPassword("");
        setFile(null);
        setTimeout(() => router.push("/profile"), 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zerogreen animate-pulse font-mono">{t("profileEdit.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 text-gray-300">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl font-bold text-white ${orbitron.className}`}>
            <span className="text-zerogreen">◆</span> {t("profileEdit.title")}
          </h1>
          <Button
            variant="light"
            onClick={() => router.push("/profile")}
            className="text-gray-400 hover:text-white"
          >
            {t("profileEdit.back")}
          </Button>
        </div>

        <Card className="bg-transparent shadow-none">
          <CardBody className="p-0 sm:p-4">
            <form onSubmit={handleSave} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-sm font-mono">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-zerogreen/20 border border-zerogreen/50 text-zerogreen rounded text-sm font-mono">
                  {success}
                </div>
              )}

              <div className="space-y-6">
                <h3 className={`text-3xl text-white ${orbitron.className}`}>
                  {t("profileEdit.publicInfo")}
                </h3>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-lg font-mono text-gray-300 mb-4">{t("profileEdit.avatarUpload")}</label>
                    <div className="flex items-center gap-6 bg-black/40 p-6 rounded-xl border border-gray-800">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-zerogreen" />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-900 flex items-center justify-center border-4 border-dashed border-gray-600 text-3xl">?</div>
                      )}
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="text-base text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-zerogreen/20 file:text-zerogreen hover:file:bg-zerogreen/30 cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 font-mono ml-2">{t("profileEdit.avatarDesc")}</p>
                      </div>
                    </div>
                  </div>
                  <Input
                    size="lg"
                    label={t("profileEdit.username")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    classNames={{ inputWrapper: "bg-white/5 border-white/10" }}
                    isRequired
                  />
                </div>
              </div>

              <Spacer y={2} />
              <div className="h-px bg-gray-800 w-full" />
              <Spacer y={2} />

              <div className="space-y-6">
                <h3 className={`text-3xl text-white ${orbitron.className}`}>
                  {t("profileEdit.accountSecurity")}
                </h3>
                <Input
                  size="lg"
                  type="email"
                  label={t("profileEdit.emailAddress")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  classNames={{ inputWrapper: "bg-white/5 border-white/10" }}
                  isRequired
                />
                {email !== originalEmail && (
                  <p className="text-xs text-orange-400 font-mono mt-1">
                    {t("profileEdit.emailChangeWarning")}
                  </p>
                )}
                
                <div className="p-6 bg-white/5 rounded-lg space-y-4">
                  <p className="text-sm text-gray-400 font-mono mb-2">{t("profileEdit.securityConfirmation")}</p>
                  
                  <Input
                    size="lg"
                    type="password"
                    label={t("profileEdit.currentPassword")}
                    placeholder={email !== originalEmail ? t("profileEdit.reqChangeEmail") : t("profileEdit.reqChangePassword")}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    classNames={{ inputWrapper: "bg-black/40 border-black/50" }}
                    isRequired={newPassword.length > 0 || email !== originalEmail}
                  />

                  <Input
                    size="lg"
                    type="password"
                    label={t("profileEdit.newPassword")}
                    placeholder={t("profileEdit.leaveBlank")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    classNames={{ inputWrapper: "bg-black/40 border-black/50" }}
                  />
                  
                  <Input
                    size="lg"
                    type="password"
                    label={t("profileEdit.confirmNewPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    classNames={{ inputWrapper: "bg-black/40 border-black/50" }}
                    isRequired={newPassword.length > 0}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  className="bg-zerogreen text-black font-bold hover:bg-zerogreen/80"
                  isLoading={saving}
                >
                  {t("profileEdit.saveChanges")}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
