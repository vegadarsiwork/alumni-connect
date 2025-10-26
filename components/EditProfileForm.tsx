"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EditProfileFormProps {
  user: User;
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await updateProfile(formData);

      if (result.success) {
        toast.success("Profile updated successfully.");
        setOpen(false);
        window.location.reload(); // Refresh to show new data
      }
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="grid w-full gap-1.5">
              <label htmlFor="headline" className="text-sm font-medium">
                Headline
              </label>
              <Input
                id="headline"
                name="headline"
                defaultValue={user.headline || ""}
                placeholder="Software Engineer at Company"
              />
            </div>

            <div className="grid w-full gap-1.5">
              <label htmlFor="education" className="text-sm font-medium">
                Education
              </label>
              <Input
                id="education"
                name="education"
                defaultValue={user.education || ""}
                placeholder="BITS Pilani, B.Tech Computer Science"
              />
            </div>

            <div className="grid w-full gap-1.5">
              <label htmlFor="image" className="text-sm font-medium">
                Profile Image URL
              </label>
              <Input
                id="image"
                name="image"
                defaultValue={user.image || ""}
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            <div className="grid w-full gap-1.5">
              <label htmlFor="skills" className="text-sm font-medium">
                Skills (comma-separated)
              </label>
              <Input
                id="skills"
                name="skills"
                defaultValue={user.skills?.join(", ") || ""}
                placeholder="React, Node.js, TypeScript"
              />
              <p className="text-xs text-muted-foreground">
                Separate skills with commas (e.g., &quot;React, Node.js, TypeScript&quot;)
              </p>
            </div>

            <div className="grid w-full gap-1.5">
              <label htmlFor="availability" className="text-sm font-medium">
                Availability
              </label>
              <select
                id="availability"
                name="availability"
                defaultValue={user.availability || "AVAILABLE"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BUSY">BUSY</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}