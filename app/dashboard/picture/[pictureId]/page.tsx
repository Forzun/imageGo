"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useRef, useState } from "react";

interface textElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export default function Picture({
  params,
}: {
  params: Promise<{ pictureId: string }>;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<textElement[]>([
    {
      id: "1",
      content: "New Text",
      x: 100,
      y: 100,
      fontSize: 30,
      color: "white",
    },
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingText, setIsAddingText] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { pictureId: id } = React.use(params);

  function genrateId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  function getImageCoords(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    imgeElement: HTMLElement
  ) {
    const rect = imgeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  function hanldeImageClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    if (!isAddingText || !imageContainerRef.current) return;
    const coords = getImageCoords(event, imageContainerRef.current);
    const newText = {
      id: genrateId(),
      content: "New Text",
      x: coords.x,
      y: coords.y,
      fontSize: 30,
      color: "white",
    };
    setTextElements([...textElements, newText]);
    setIsAddingText(false);
  }

  function handleEditComplete() {
    setIsEditing(false);
    setSelectedTextId(null);
  }

  function handleTextClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    textid: string
  ) {
    event.stopPropagation();
    setSelectedTextId(textid);
  }

  function handleKeyDown(event: React.KeyboardEvent, textId: string) {
    if (event.key === "Enter") {
      handleEditComplete();
    }
    if (event.key === "Escape") {
      handleEditComplete();
    }
  }

  function updateTextContent(textId: string, newContent: string) {
    setTextElements((prev) =>
      prev.map((text) =>
        text.id == textId ? { ...text, content: newContent } : text
      )
    );
  }

  function doubleClickHandler(textId: string) {
    setSelectedTextId(textId);
    setIsEditing(true);
  }

  return (
    <div className="container-wrapper border-1 border-x ">
      <div>
        <h1>Picture {id}</h1>
        <div
          ref={imageContainerRef}
          onClick={hanldeImageClick}
          className="relative w-[500px] h-[500px] border"
        >
          <Image
            src="/home.png"
            alt="Picture"
            fill
            style={{ objectFit: "cover" }}
          />
          {textElements.map((text) => (
            <div
              key={text.id}
              onClick={(e) => handleTextClick(e, text.id)}
              onDoubleClick={() => doubleClickHandler(text.id)}
              className="absolute cursor-move select-none"
              style={{
                left: text.x + "px",
                top: text.y + "px",
                fontSize: text.fontSize + "px",
                color: text.color,
                textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
              }}
            >
              {isEditing && selectedTextId === text.id ? (
                <input
                  autoFocus
                  defaultValue={text.content}
                  onBlur={handleEditComplete}
                  onKeyDown={(e) => handleKeyDown(e, text.id)}
                  onChange={(e) => updateTextContent(text.id, e.target.value)}
                  style={{
                    fontSize: text.fontSize,
                    color: text.color,
                    background: "transparent",
                    border: "1px solid white",
                  }}
                />
              ) : (
                text.content
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-10">
        <Button>download image</Button>
        <Button onClick={() => setIsAddingText(true)} variant="outline">
          Add Text
        </Button>
      </div>
    </div>
  );
}
