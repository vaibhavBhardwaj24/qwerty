"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface MentionListProps {
  items: Array<{
    id: string;
    userId: string;
    name: string;
    role: string;
  }>;
  command: (item: any) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="mention-dropdown">
        {props.items.length ? (
          props.items.map((item, index) => (
            <button
              className={`mention-item ${
                index === selectedIndex ? "is-selected" : ""
              }`}
              key={item.id}
              onClick={() => selectItem(index)}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {item.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="mention-item-content">
                <p className="mention-item-name">{item.name}</p>
                <p className="mention-item-role">{item.role}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="mention-item">No members found</div>
        )}
      </div>
    );
  }
);

MentionList.displayName = "MentionList";
