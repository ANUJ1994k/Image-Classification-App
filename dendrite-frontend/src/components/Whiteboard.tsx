import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import io from "socket.io-client";
import { jsPDF } from "jspdf";

const socket = io("http://localhost:5000");

// Define types for Line
interface LineData {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

const Whiteboard: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [lines, setLines] = useState<LineData[]>([]);
  const [redoStack, setRedoStack] = useState<LineData[]>([]);
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const isDrawing = useRef<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const stageRef = useRef<any>(null);

  useEffect(() => {
    socket.on("receive-message", (msg: string) => {
      setChatMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("receive-message");
    };
  }, []);

  const handleSendInvite = async () => {
    const response = await fetch("http://localhost:5000/send-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: inviteEmail,
        sessionUrl: window.location.href,
      }),
    });
    const data = await response.json();
    alert(data.message);
  };

  const exportAsImage = () => {
    const uri = stageRef.current?.toDataURL();
    if (!uri) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = uri;
    link.click();
  };

  const exportAsPDF = () => {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
    if (!uri) return;
    const pdf = new jsPDF("landscape", "pt", "a4");
    const imgProps = pdf.getImageProperties(uri);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(uri, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("whiteboard.pdf");
  };

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y], stroke: color, strokeWidth }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    const updatedLine = {
      ...lastLine,
      points: [...lastLine.points, point.x, point.y],
    };
    socket.emit("draw-line", updatedLine);
    setLines([...lines.slice(0, -1), updatedLine]);
  };

  useEffect(() => {
    socket.on("draw-line", (line: LineData) => {
      setLines((prevLines) => [...prevLines, line]);
    });
    return () => {
      socket.off("draw-line");
    };
  }, []);

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleUndo = () => {
    if (lines.length === 0) return;
    const newLines = [...lines];
    const last = newLines.pop();
    if (!last) return;
    setLines(newLines);
    setRedoStack([...redoStack, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const newRedo = [...redoStack];
    const recovered = newRedo.pop();
    if (!recovered) return;
    setRedoStack(newRedo);
    setLines([...lines, recovered]);
  };

  return (
    <div className="container py-4">
      <div className="row mb-3">
        <div className="col-md-6 d-flex align-items-center">
          <label className="form-label me-2 mb-0">Brush Color:</label>
          <input
            type="color"
            className="form-control form-control-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Choose your color"
          />
        </div>
        <div className="col-md-6 d-flex align-items-center">
          <label htmlFor="brushSize" className="form-label me-2 mb-0">Size:</label>
          <input
            type="range"
            className="form-range"
            id="brushSize"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mb-3 d-flex gap-2">
        <button className="btn btn-warning" onClick={handleUndo}>Undo</button>
        <button className="btn btn-success" onClick={handleRedo}>Redo</button>
        <button className="btn btn-primary" onClick={exportAsImage}>Save as Image</button>
        <button className="btn btn-secondary" onClick={exportAsPDF}>Save as PDF</button>
      </div>

      <div className="border rounded p-2 mb-3" style={{ height: '80vh' }}>
        <Stage
          ref={stageRef}
          width={window.innerWidth - 100}
          height={window.innerHeight - 200}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation="source-over"
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <div className="input-group mb-3">
        <input
          type="email"
          placeholder="Enter email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="form-control"
        />
        <button className="btn btn-success" onClick={handleSendInvite}>Send Invite</button>
      </div>

      <div className="border-top mt-4 pt-3">
        <div className="p-2 mb-2 bg-light" style={{ height: '150px', overflowY: 'auto' }}>
          {chatMessages.map((msg, idx) => (
            <div key={idx} className="text-muted small mb-1">{msg}</div>
          ))}
        </div>
        <div className="input-group">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-control"
            placeholder="Type a message..."
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              socket.emit("send-message", message);
              setChatMessages((prev) => [...prev, message]);
              setMessage("");
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
