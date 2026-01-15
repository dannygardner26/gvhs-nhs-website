"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function SystemSettings() {
    const [requireApproval, setRequireApproval] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/admin/settings/approval");
            if (response.ok) {
                const data = await response.json();
                setRequireApproval(data.requireApproval);
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
            setError("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (checked: boolean) => {
        setSaving(true);
        setError("");
        setSuccess("");

        // Optimistic update
        setRequireApproval(checked);

        try {
            const response = await fetch("/api/admin/settings/approval", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requireApproval: checked }),
            });

            if (!response.ok) {
                throw new Error("Failed to save setting");
            }

            setSuccess("Settings saved successfully");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Error saving settings", err);
            setError("Failed to save settings");
            setRequireApproval(!checked); // Revert on error
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Settings
                </CardTitle>
                <CardDescription>
                    Global configuration for the NHS Portal
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                        <Label htmlFor="approval-mode" className="text-base font-medium">
                            Require Admin Approval
                        </Label>
                        <p className="text-sm text-gray-500">
                            New accounts must be approved by an administrator before they can log in.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                        <Switch
                            id="approval-mode"
                            checked={requireApproval}
                            onCheckedChange={handleToggle}
                            disabled={saving}
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                        <CheckCircle2 className="w-4 h-4" />
                        {success}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
