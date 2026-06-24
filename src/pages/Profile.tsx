import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const { currentUser, updateProfile, logout } = useAuth();
  const [name, setName] = useState(currentUser?.displayName || "");
  const [imageUrl, setImageUrl] = useState(currentUser?.photoURL || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, picture: imageUrl });
      setIsEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/");
  };

  const initials =
    (currentUser?.displayName || currentUser?.email || "A")
      .split(/[\s@]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "A";

  return (
    <div className="min-h-screen bg-white pb-safe-tabbar md:pb-0">
      <div className="h-1 w-full bg-[#D4AF37]" />

      <header className="border-b border-[#E8DDB0] safe-top">
        <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 text-sm text-[#1A1A1A]/70 hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to chat</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-[#1A1A1A]/70 hover:bg-[#FBF7E9] hover:text-[#1A1A1A]"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-14">
        <div className="mb-6 md:mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] tracking-tight">Profile</h1>
          <p className="mt-2 text-sm md:text-base text-[#1A1A1A]/70">
            Manage how you appear in the Companion.
          </p>
        </div>

        <section className="bg-white border border-[#E8DDB0] rounded-2xl p-5 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-[#E8DDB0]">
                  <AvatarImage src={imageUrl} />
                  <AvatarFallback className="bg-[#FBF7E9] text-[#1A1A1A] font-medium text-lg">
                    {initials || <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 p-1.5 bg-[#D4AF37] hover:bg-[#B8941F] rounded-full cursor-pointer transition-colors shadow-sm"
                    aria-label="Upload picture"
                  >
                    <Camera className="h-3.5 w-3.5 text-[#1A1A1A]" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <div>
                <p className="font-medium text-[#1A1A1A]">
                  {currentUser?.displayName || "Add your name"}
                </p>
                <p className="text-sm text-[#1A1A1A]/60">{currentUser?.email}</p>
              </div>
            </div>

            <div className="border-t border-[#E8DDB0]" />

            {/* Fields */}
            <div className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={currentUser?.email ?? ""}
                  disabled
                  className="mt-2 h-11 bg-[#FBF7E9] border-[#E8DDB0] text-[#1A1A1A]/70"
                />
                <p className="mt-1.5 text-xs text-[#1A1A1A]/50">
                  Your ALU email cannot be changed here.
                </p>
              </div>

              <div>
                <Label htmlFor="name" className="text-sm font-medium text-[#1A1A1A]">
                  Display name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  placeholder="How you'd like to be addressed"
                  className="mt-2 h-11 bg-white border-[#E8DDB0] text-[#1A1A1A] disabled:bg-[#FBF7E9] disabled:text-[#1A1A1A]/70 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="border-t border-[#E8DDB0]" />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#1A1A1A]/60">
                <span className="font-medium text-[#1A1A1A]/80">Member since </span>
                {currentUser?.metadata.creationTime
                  ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })
                  : "Unknown"}
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setName(currentUser?.displayName || "");
                      setImageUrl(currentUser?.photoURL || "");
                    }}
                    className="bg-white border-[#E8DDB0] text-[#1A1A1A] hover:bg-[#FBF7E9]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#1A1A1A] hover:bg-black text-white"
                  >
                    {isSaving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A1A] font-medium"
                >
                  Edit profile
                </Button>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
