"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface textElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<textElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAddingText, setIsAddingText] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  function genrateId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(file);
      setImage(URL.createObjectURL(file));
    }
  }

  function getSelectedText() {
    return textElements.find((text) => text.id === selectedTextId);
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

  function handleImageClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    if (!isAddingText || !imageContainerRef.current) return;
    const coords = getImageCoords(event, imageContainerRef.current);
    const newText = {
      id: genrateId(),
      content: "New Text",
      x: coords.x,
      y: coords.y,
      fontSize: 48,
      color: "white", // Fix: "while" → "white"
    };
    setTextElements([...textElements, newText]);
    setIsAddingText(false);
  }

  function handleTextClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    textid: string
  ) {
    event.stopPropagation();
    setSelectedTextId(textid);
  }

  function doubleClickHandler(textId: string) {
    setSelectedTextId(textId);
    setIsEditing(true);
  }

  function updateTextContent(textId: string, newContent: string) {
    setTextElements((prev) =>
      prev.map((text) =>
        text.id === textId ? { ...text, content: newContent } : text
      )
    );
  }

  function handleEditComplete() {
    setIsEditing(false);
    setSelectedTextId(null);
  }

  function handleKeyDown(event: React.KeyboardEvent, textId: string) {
    if (event.key === "Enter") {
      handleEditComplete();
    }
    if (event.key === "Escape") {
      {
        handleEditComplete();
      }
    }
  }

  return (
    <div>
      <div
        ref={imageContainerRef}
        onClick={handleImageClick}
        className="relative inline-block"
      >
        <Image
          src={image || "/home.png"}
          width={500}
          height={500}
          alt="Picture"
        />

        {/* Render all text elements */}
        {textElements.map((text) => (
          <div
            key={text.id}
            style={{
              position: "absolute",
              left: text.x,
              top: text.y,
              fontSize: text.fontSize,
              color: text.color,
              cursor: "pointer",
            }}
            onClick={(e) => handleTextClick(e, text.id)}
            onDoubleClick={() => doubleClickHandler(text.id)}
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

      <div className="flex items-center pt-10">
        <h2>Select Image</h2>
        <input type="file" name="MyImage" onChange={handleImageUpload} />
        <Button onClick={() => setIsAddingText(true)}>Add text</Button>
      </div>
    </div>
  );
}
