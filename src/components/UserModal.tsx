"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { User } from "@/lib/users";
import { Save, Shield, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => Promise<void>;
    user?: User | null;
}

export function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
    const [formData, setFormData] = useState<Partial<User>>({
        name: "",
        email: "",
        password: "",
        role: "Pegawai",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(user);
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "Pegawai",
            });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave({
                ...formData,
                id: user?.id || Date.now().toString(),
                createdAt: user?.createdAt || new Date(),
            } as User);
            onClose();
        } catch (error) {
            toast.error("Gagal menyimpan data pengguna");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-slate-200 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        {user ? "Edit" : "Tambah"} <span className="text-green-600">Pengguna</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <UserIcon className="w-3.5 h-3.5 text-green-600" />
                            Nama Lengkap
                        </Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-green-500/20"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-green-600" />
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-green-500/20"
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-green-600" />
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            required={!user}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-green-500/20"
                            placeholder={user ? "Biarkan kosong jika tidak diubah" : "••••••••"}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-green-600" />
                            Peran (Role)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            {["Pegawai", "Admin"].map((role) => (
                                <Button
                                    key={role}
                                    type="button"
                                    variant={formData.role === role ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, role: role as any })}
                                    className={cn(
                                        "h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-2",
                                        formData.role === role
                                            ? "bg-green-600 border-green-600 hover:bg-green-700 shadow-xl shadow-green-100"
                                            : "border-slate-100 text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {role}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-50 gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="h-12 flex-1 rounded-xl font-black text-slate-500 hover:bg-slate-100"
                        >
                            BATAL
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    SIMPAN
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
