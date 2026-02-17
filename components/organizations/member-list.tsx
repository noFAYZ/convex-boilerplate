"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MemberListProps {
  organizationId: Id<"organizations">;
}

export function MemberList({ organizationId }: MemberListProps) {
  const members = useQuery(api.members.list, { organizationId });
  const updateRole = useMutation(api.members.updateRole);
  const removeMember = useMutation(api.members.remove);

  if (!members) {
    return <div>Loading members...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                {member.user?.image && (
                  <img
                    src={member.user.image}
                    alt={member.user.name}
                    className="size-10 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">{member.user?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.user?.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={member.role}
                  onValueChange={(role) =>
                    updateRole({
                      memberId: member._id,
                      role: role as "owner" | "admin" | "member",
                    })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeMember({ memberId: member._id })}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
