"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClueInfo, CrosswordData, CrosswordGrid, GridBox } from "./types/crossword"
import { loadJson } from "./crossword/loadJson"

export default function CrosswordPuzzle() {
  const [loading, setLoading] = useState(true)
  const inputRefs = useRef<Record<string, HTMLInputElement>>({})
  const gridRef = useRef<HTMLDivElement>(null)

  const [crosswordGrid, setCrosswordGrid] = useState<GridBox[][] | null>(null);
  const [acrossClues, setAcrossClues] = useState<Record<number, ClueInfo>>({});
  const [downClues, setDownClues] = useState<Record<number, ClueInfo>>({});
  const [gridSize, setGridSize] = useState<number>(0);


  const [processedCrossword, setProcessedCrossword] = useState<CrosswordGrid | null>(null)
  const [selectedCell, setSelectedCell] = useState<GridBox| null>(null)
  const [selectWord, setSelectWord] = useState<string | null>(null)
  const [userBoard, setUserboard] = useState<boolean[][] | null>(null)

  const initCrossword = (processedCrossword: CrosswordGrid): boolean[][] => {
    const gridSize = processedCrossword.gridSize
    setGridSize(processedCrossword.gridSize);
    setCrosswordGrid(processedCrossword.grid);
    setAcrossClues(processedCrossword.across);
    setDownClues(processedCrossword.down);
    return Array.from({ length: gridSize }, (_, row) =>
      Array.from({ length: gridSize }, (_, col) => processedCrossword.grid[row][col].isBlocked),
    )
  }

  useEffect(() => {
    const fetchCrosswordData = async () => {
      try {
        const response = await fetch("/test.json")

        if (!response.ok) {
          throw new Error("Failed to fetch crossword data")
        }

        const crosswordData: CrosswordData = await response.json()

        // Process the loaded JSON data
        const processed = loadJson(crosswordData)
        const userBoard = initCrossword(processed)

        setUserboard(userBoard)
        setProcessedCrossword(processed)
        setLoading(false) // Set loading to false once data is loaded

        console.log(processed)
        console.log(userBoard)
      } catch (error) {
        console.error("Error loading crossword data:", error)
        setProcessedCrossword(null)
        setLoading(false) // Set loading to false even if there's an error
      }
    }

    fetchCrosswordData()
  }, []) // Removed processedCrossword as a dependency

  const handleCellClick = (row: number, col: number) => {
    if (crosswordGrid && !userBoard?.[row][col]) {
      const selectedGridBox = crosswordGrid[row][col];
      setSelectedCell(selectedGridBox);
      
      if (selectedGridBox.across && selectedGridBox.down) {
        // If both across and down exist, toggle between them
        if (selectWord === downClues[selectedGridBox.down].answer) {
          setSelectWord(acrossClues[selectedGridBox.across].answer);
        } else {
          setSelectWord(downClues[selectedGridBox.down].answer);
        }
      } else if (selectedGridBox.down) {
        setSelectWord(downClues[selectedGridBox.down].answer);
      } else if (selectedGridBox.across) {
        setSelectWord(acrossClues[selectedGridBox.across].answer);
      } else {
        setSelectWord(null);
      }
      
      console.log(`Cell clicked: ${row}, ${col}`, selectedGridBox);
    }
  };
  
  
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading crossword puzzle...</div>
  }

  // If userBoard is null, show a message
  if (!userBoard) {
    return <div className="flex items-center justify-center h-screen">No crossword data available</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Crossword Puzzle</CardTitle>
          <CardDescription>Fill in the crossword puzzle</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={gridRef}
            className="grid gap-0 border border-gray-300 w-full max-w-xl mx-auto"
            style={{
              gridTemplateColumns: `repeat(${userBoard[0].length}, 1fr)`,
              aspectRatio: "1/1",
            }}
          >
            {userBoard.map((row, rowIndex) =>
              row.map((isBlocked, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`relative flex items-center justify-center border border-gray-300 ${
                    isBlocked ? "bg-black" : "bg-white"
                  }`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {!isBlocked && (
                    <input
                      type="text"
                      maxLength={1}
                      className="w-full h-full text-center uppercase font-bold bg-transparent focus:outline-none focus:bg-blue-100"
                      ref={(el) => {
                        if (el) inputRefs.current[`${rowIndex}-${colIndex}`] = el
                      }}
                    />
                  )}
                </div>
              )),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

