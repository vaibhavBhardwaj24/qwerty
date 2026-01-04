"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  userId: string;
  name: string;
  role: string;
}

interface MentionAssigneeInputProps {
  value: string;
  onChange: (value: string, userId?: string) => void;
  members: Member[];
  placeholder?: string;
  required?: boolean;
}

export function MentionAssigneeInput({
  value,
  onChange,
  members,
  placeholder = "Type @ to mention someone...",
  required = false,
}: MentionAssigneeInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter members based on input
  useEffect(() => {
    console.log("Value changed:", value, "Members count:", members.length);
    if (value.startsWith("@")) {
      const query = value.slice(1).toLowerCase();
      console.log("Filtering with query:", query);
      const filtered = members.filter((member) =>
        member.name.toLowerCase().includes(query)
      );
      console.log("Filtered members:", filtered);
      setFilteredMembers(filtered);
      setShowDropdown(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowDropdown(false);
    }
  }, [value, members]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectMember = (member: Member) => {
    onChange(member.name, member.userId);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredMembers[selectedIndex]) {
          selectMember(filteredMembers[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className="h-9"
      />

      {showDropdown && filteredMembers.length > 0 && (
        <div
          ref={dropdownRef}
          className="mention-dropdown absolute top-full left-0 right-0 mt-1 z-50"
        >
          {filteredMembers.map((member, index) => (
            <button
              key={member.id}
              type="button"
              className={cn(
                "mention-item",
                index === selectedIndex && "is-selected"
              )}
              onClick={() => selectMember(member)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="mention-item-content">
                <p className="mention-item-name">{member.name}</p>
                <p className="mention-item-role">{member.role}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
