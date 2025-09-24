"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Draggable from "react-draggable";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { toPng } from "html-to-image";

interface textElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

function DraggableText({
  text,
  onClick,
  onDoubleClick,
  onDrag,
}: {
  text: textElement;
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onDoubleClick: () => void;
  onDrag: (textId: string, x: number, y: number) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: text.x, y: text.y }}
      onDrag={(e, data) => onDrag(text.id, data.x, data.y)}
      onStop={(e, data) => onDrag(text.id, data.x, data.y)}
    >
      <div
        ref={nodeRef}
        className="cursor-move select-none"
        style={{ fontSize: text.fontSize + "px", color: text.color }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        {text.content}
      </div>
    </Draggable>
  );
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

  function updateTextPosition(textid: string, dataX: number, dataY: number) {
    setTextElements((prev) =>
      prev.map((text) =>
        text.id == textid ? { ...text, x: dataX, y: dataY } : text
      )
    );
  }

  const downloadImage = async () => {
    if (!imageContainerRef.current) return;
    try {
      const dataUrl = await toPng(imageContainerRef.current, {
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = "final-image.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div>
      {/* Container with image + draggable text */}
      <div
        ref={imageContainerRef}
        onClick={handleImageClick}
        className="relative w-[500px] h-[500px] border"
      >
        <Image
          src="/home.png"
          alt="Picture"
          fill
          style={{ objectFit: "cover" }}
        />

        {/* Draggable text */}
        {textElements.map((text) => (
          <motion.div
            key={text.id}
            drag
            dragConstraints={imageContainerRef} // restrict to container
            initial={{ x: text.x, y: text.y }}
            onDragEnd={(e, info) => {
              // save updated position when drag ends
              updateTextPosition(text.id, info.point.x, info.point.y);
            }}
            onClick={(e) => handleTextClick(e, text.id)} // single click
            onDoubleClick={() => doubleClickHandler(text.id)} // double click
            className="absolute cursor-move select-none"
            style={{
              fontSize: text.fontSize + "px",
              color: text.color,
            }}
          >
            {isEditing && selectedTextId === text.id ? (
              <input
                autoFocus
                defaultValue={text.content}
                onBlur={handleEditComplete} // finish editing on blur
                onKeyDown={(e) => handleKeyDown(e, text.id)} // save on Enter, cancel on Esc
                onChange={(e) => updateTextContent(text.id, e.target.value)} // live update
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
          </motion.div>
        ))}
      </div>
      {/* Download button */}
      <button
        onClick={downloadImage}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Download Image
      </button>{" "}
      <Button onClick={() => setIsAddingText(true)} className="mt-4">
        Add text
      </Button>
    </div>
  );
}
