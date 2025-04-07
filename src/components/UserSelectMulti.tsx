import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from "lucide-react";
import { getUsers } from '@/services/userManagementService';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface UserSelectMultiProps {
  selectedUserIds: string[];
  onChange: (selectedUserIds: string[]) => void;
  placeholder?: string;
  filterRole?: string | string[];
  className?: string;
  disabled?: boolean;
}

export default function UserSelectMulti({
  selectedUserIds = [],
  onChange,
  placeholder = "Select users",
  filterRole,
  className,
  disabled = false
}: UserSelectMultiProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await getUsers();
        
        // Filter users by role if specified
        let filteredUsers = fetchedUsers;
        if (filterRole) {
          const roles = Array.isArray(filterRole) ? filterRole : [filterRole];
          filteredUsers = fetchedUsers.filter(user => roles.includes(user.role));
        }
        
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filterRole]);

  // Get selected users' details
  const selectedUsers = users.filter(user => selectedUserIds.includes(user._id));

  const handleSelect = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  const handleRemove = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedUserIds.filter(id => id !== userId));
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedUsers.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-w-[90%] overflow-hidden">
              {selectedUsers.slice(0, 2).map(user => (
                <Badge 
                  key={user._id} 
                  variant="secondary"
                  className="flex items-center gap-1 max-w-[150px] truncate"
                >
                  {user.username}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={(e) => handleRemove(user._id, e)}
                  />
                </Badge>
              ))}
              {selectedUsers.length > 2 && (
                <Badge variant="secondary">+{selectedUsers.length - 2} more</Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search users..." />
          {loading ? (
            <div className="py-6 text-center text-sm">Loading users...</div>
          ) : (
            <>
              <CommandList>
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[200px]">
                    {users.map(user => (
                      <CommandItem
                        key={user._id}
                        value={user._id}
                        onSelect={() => handleSelect(user._id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedUserIds.includes(user._id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{user.username}</span>
                          <span className="text-xs text-muted-foreground">{user.email} ({user.role})</span>
                        </div>
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
              {selectedUserIds.length > 0 && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={handleClear}
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
} 