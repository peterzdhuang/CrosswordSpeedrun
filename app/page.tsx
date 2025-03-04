"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define types for our crossword data
type CrosswordWord = {
  word: string
  clue: string
  direction: "across" | "down"
  startRow: number
  startCol: number
}

type CrosswordData = {
  size: number
  words: CrosswordWord[]
}

export default function CrosswordPuzzle() {
  // State for the crossword grid
  const [grid, setGrid] = useState<string[][]>([])
  const [userGrid, setUserGrid] = useState<string[][]>([])
  const [crosswordData, setCrosswordData] = useState<CrosswordData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cellNumbers, setCellNumbers] = useState<(number | null)[][]>([])
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [currentDirection, setCurrentDirection] = useState<"across" | "down">("down") // Default to down
  const [currentWord, setCurrentWord] = useState<CrosswordWord | null>(null)
  const [highlightedCells, setHighlightedCells] = useState<[number, number][]>([])

  // Create a ref to store input references
  const inputRefs = useRef<Record<string, HTMLInputElement>>({})
  const gridRef = useRef<HTMLDivElement>(null)

  // Load crossword data from JSON
  useEffect(() => {
    const loadCrosswordData = async () => {
      try {
        // In a real app, you would fetch this from an API or file
        // For demo purposes, we'll use a hardcoded example
        const data: CrosswordData = {
          size: 5,
          words: [
            { word: "HELLO", clue: "A greeting", direction: "across", startRow: 0, startCol: 0 },
            { word: "EARTH", clue: "Our planet", direction: "down", startRow: 0, startCol: 0 },
            { word: "LASER", clue: "Focused light beam", direction: "across", startRow: 2, startCol: 0 },
            { word: "OCEAN", clue: "Vast body of water", direction: "down", startRow: 0, startCol: 4 },
            { word: "TRAIN", clue: "Rail transport", direction: "across", startRow: 4, startCol: 0 },
          ],
        }

        setCrosswordData(data)
        initializeGrids(data)
        calculateCellNumbers(data)
        setLoading(false)

        // Set initial selection to first word
        if (data.words.length > 0) {
          // Find a down word to start with if possible
          const firstDownWord = data.words.find((word) => word.direction === "down")
          if (firstDownWord) {
            setSelectedCell([firstDownWord.startRow, firstDownWord.startCol])
            setCurrentDirection("down")
          } else {
            const firstWord = data.words[0]
            setSelectedCell([firstWord.startRow, firstWord.startCol])
            setCurrentDirection(firstWord.direction)
          }
        }
      } catch (error) {
        console.error("Failed to load crossword data:", error)
        setLoading(false)
      }
    }

    loadCrosswordData()
  }, [])

  // Update current word and highlighted cells when selected cell or direction changes
  useEffect(() => {
    if (!selectedCell || !crosswordData) return

    const [row, col] = selectedCell

    // Find the current word based on selected cell and direction
    let word = null
    if (currentDirection === "across") {
      word = crosswordData.words.find(
        (w) => w.direction === "across" && w.startRow === row && col >= w.startCol && col < w.startCol + w.word.length,
      )
    } else {
      word = crosswordData.words.find(
        (w) => w.direction === "down" && w.startCol === col && row >= w.startRow && row < w.startRow + w.word.length,
      )
    }

    setCurrentWord(word)

    // Highlight cells for the current word
    if (word) {
      const cells: [number, number][] = []
      if (word.direction === "across") {
        for (let i = 0; i < word.word.length; i++) {
          cells.push([word.startRow, word.startCol + i])
        }
      } else {
        for (let i = 0; i < word.word.length; i++) {
          cells.push([word.startRow + i, word.startCol])
        }
      }
      setHighlightedCells(cells)
    } else {
      setHighlightedCells([])
    }
  }, [selectedCell, currentDirection, crosswordData])

  // Focus the input when selected cell changes
  useEffect(() => {
    if (selectedCell) {
      const [row, col] = selectedCell
      const inputRef = inputRefs.current[`${row}-${col}`]
      if (inputRef) {
        setTimeout(() => {
          inputRef.focus()
        }, 0)
      }
    }
  }, [selectedCell])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !gridRef.current) return

      const [row, col] = selectedCell
      let newRow = row
      let newCol = col

      // Handle arrow key navigation
      switch (e.key) {
        case "ArrowUp":
          newRow = Math.max(0, row - 1)
          break
        case "ArrowDown":
          newRow = Math.min(grid.length - 1, row + 1)
          break
        case "ArrowLeft":
          newCol = Math.max(0, col - 1)
          break
        case "ArrowRight":
          newCol = Math.min(grid[0].length - 1, col + 1)
          break
        case "Tab": {
          e.preventDefault(); // Prevent tab from moving focus out of grid

          const nextDirection = currentDirection === "across" ? "down" : "across";
          setCurrentDirection(nextDirection);

          // Find the first word in the new direction
          if (crosswordData?.words) {
            const nextWord = crosswordData.words.find(word => word.direction === nextDirection);
            if (nextWord) {
              setSelectedCell([nextWord.startRow, nextWord.startCol]);
            } else {
              // If no word in the new direction, maybe keep the current selection or find the first word overall
              if (crosswordData.words.length > 0) {
                const firstWord = crosswordData.words[0];
                setSelectedCell([firstWord.startRow, firstWord.startCol]);
                setCurrentDirection(firstWord.direction);
              } else {
                setSelectedCell(null); // No words at all
              }
            }
          }
          return; // Important to return after handling tab to avoid default arrow key logic
        }
        default:
          return // Exit for other keys
      }

      // Only move if the target cell is valid (not a black cell)
      if (grid[newRow][newCol]) {
        e.preventDefault() // Prevent default scrolling behavior
        setSelectedCell([newRow, newCol])

        // Update direction based on arrow key if needed
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          setCurrentDirection("down")
        } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          setCurrentDirection("across")
        }
      }
    }

    // Track focus changes to update the selected cell
    const handleFocusChange = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement) {
        // Find which cell this input belongs to
        for (const key in inputRefs.current) {
          if (inputRefs.current[key] === e.target) {
            const [row, col] = key.split("-").map(Number)
            setSelectedCell([row, col])

            // Determine the appropriate direction based on available words
            const { across, down } = getAvailableDirections(row, col)
            if (down) {
              setCurrentDirection("down")
            } else if (across) {
              setCurrentDirection("across")
            }

            break
          }
        }
      }
    }

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("focusin", handleFocusChange)

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("focusin", handleFocusChange)
    }
  }, [selectedCell, grid, currentDirection, crosswordData])
  // Initialize the grid with the crossword data
  const initializeGrids = (data: CrosswordData) => {
    const size = data.size
    const emptyGrid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(""))
    const solutionGrid = [...emptyGrid.map((row) => [...row])]

    // Fill in the solution grid
    data.words.forEach(({ word, direction, startRow, startCol }) => {
      for (let i = 0; i < word.length; i++) {
        if (direction === "across") {
          solutionGrid[startRow][startCol + i] = word[i]
        } else {
          solutionGrid[startRow + i][startCol] = word[i]
        }
      }
    })

    setGrid(solutionGrid)
    setUserGrid(emptyGrid)
  }

  // Calculate cell numbers for the grid
  const calculateCellNumbers = (data: CrosswordData) => {
    const size = data.size
    const numbers: (number | null)[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null))
    let currentNumber = 1

    data.words.forEach(({ startRow, startCol }) => {
      if (numbers[startRow][startCol] === null) {
        numbers[startRow][startCol] = currentNumber++
      }
    })

    setCellNumbers(numbers)
  }

  // Handle cell input change
  const handleCellChange = (row: number, col: number, value: string) => {
    if (value.length > 1) value = value.charAt(value.length - 1)
    value = value.toUpperCase()

    const newUserGrid = [...userGrid]
    newUserGrid[row][col] = value
    setUserGrid(newUserGrid)

    // Only move to next cell if a value was entered
    if (value) {
      let nextRow = row
      let nextCol = col

      if (currentDirection === "across") {
        // Move to next cell horizontally
        nextCol = col + 1
      } else {
        // Move to next cell vertically
        nextRow = row + 1
      }

      // Check if the next cell is within grid bounds and part of the current word
      if (
        nextRow >= 0 &&
        nextRow < grid.length &&
        nextCol >= 0 &&
        nextCol < grid[0].length &&
        grid[nextRow][nextCol] && // Make sure it's not a black cell
        highlightedCells.some(([r, c]) => r === nextRow && c === nextCol)
      ) {
        // Update the selected cell
        setSelectedCell([nextRow, nextCol])
      }
    }
  }

  // Find available directions for a cell
  const getAvailableDirections = (row: number, col: number) => {
    if (!crosswordData) return { across: false, down: false }

    const acrossWord = crosswordData.words.find(
      (w) => w.direction === "across" && w.startRow === row && col >= w.startCol && col < w.startCol + w.word.length,
    )

    const downWord = crosswordData.words.find(
      (w) => w.direction === "down" && w.startCol === col && row >= w.startRow && row < w.startRow + w.word.length,
    )

    return {
      across: !!acrossWord,
      down: !!downWord,
    }
  }

  // Handle cell selection
  const handleCellSelect = (row: number, col: number) => {
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      // Toggle direction if clicking the same cell
      setCurrentDirection(currentDirection === "across" ? "down" : "across")
    } else {
      setSelectedCell([row, col])

      // Check available directions and set appropriate direction
      const { across, down } = getAvailableDirections(row, col)

      if (down) {
        // Prioritize down direction if available
        setCurrentDirection("down")
      } else if (across) {
        setCurrentDirection("across")
      }
      // If neither direction is available, keep the current direction (shouldn't happen)
    }
  }

  // Check if the puzzle is solved
  const checkSolution = () => {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] && grid[i][j] !== userGrid[i][j]) {
          return false
        }
      }
    }
    return true
  }

  // Reset the puzzle
  const resetPuzzle = () => {
    setUserGrid(
      Array(grid.length)
        .fill(null)
        .map(() => Array(grid.length).fill("")),
    )
  }

  // Reveal the solution
  const revealSolution = () => {
    setUserGrid([...grid.map((row) => [...row])])
  }

  // Check if a cell is highlighted
  const isCellHighlighted = (row: number, col: number) => {
    return highlightedCells.some(([r, c]) => r === row && c === col)
  }

  // Check if a cell is the selected cell
  const isSelectedCell = (row: number, col: number) => {
    return selectedCell && selectedCell[0] === row && selectedCell[1] === col
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading crossword puzzle...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">5×5 Crossword Puzzle</CardTitle>
          <CardDescription className="text-center">Fill in the grid with the correct answers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Crossword Grid and Current Clue */}
            <div>
              {/* Current Clue Display - Always visible */}
              <div className="mb-4 p-3 border rounded-md bg-muted min-h-[80px] flex items-center">
                {currentWord ? (
                  <div>
                    <p className="font-bold">
                      {cellNumbers[currentWord.startRow][currentWord.startCol]}{" "}
                      {currentDirection.charAt(0).toUpperCase() + currentDirection.slice(1)}
                    </p>
                    <p>{currentWord.clue}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select a cell to see the clue</p>
                )}
              </div>

              {/* Crossword Grid */}
              <div
                ref={gridRef}
                className="grid grid-cols-5 gap-0 border border-gray-300 w-fit mx-auto"
                tabIndex={-1} // Make the grid focusable for keyboard events
              >
                {grid.map((row, rowIndex) =>
                  row.map((_, colIndex) => {
                    const isHighlighted = isCellHighlighted(rowIndex, colIndex)
                    const isSelected = isSelectedCell(rowIndex, colIndex)
                    const cellKey = `${rowIndex}-${colIndex}`

                    return (
                      <div
                        key={cellKey}
                        className={`relative w-12 h-12 flex items-center justify-center
                          ${grid[rowIndex][colIndex] ? "bg-white" : "bg-gray-800"}
                          ${isSelected ? "bg-blue-300" : isHighlighted ? "bg-blue-100" : ""}
                          ${isHighlighted ? "border-2 border-blue-500" : "border border-gray-300"}
                        `}
                        onClick={() => grid[rowIndex][colIndex] && handleCellSelect(rowIndex, colIndex)}
                      >
                        {cellNumbers[rowIndex][colIndex] && (
                          <span className="absolute text-xs top-0.5 left-0.5">{cellNumbers[rowIndex][colIndex]}</span>
                        )}
                        {grid[rowIndex][colIndex] && (
                          <Input
                            ref={(el) => {
                              if (el) inputRefs.current[cellKey] = el
                            }}
                            type="text"
                            value={userGrid[rowIndex][colIndex]}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            className="w-full h-full text-center text-lg font-bold p-0 border-none focus:ring-0"
                            maxLength={1}
                            onFocus={() => setSelectedCell([rowIndex, colIndex])}
                          />
                        )}
                      </div>
                    )
                  }),
                )}
              </div>

              <div className="flex justify-center mt-4 space-x-2">
                <Button onClick={resetPuzzle} variant="outline">
                  Reset
                </Button>
                <Button onClick={revealSolution} variant="outline">
                  Reveal
                </Button>
                <Button onClick={() => alert(checkSolution() ? "Correct!" : "Not quite right yet!")}>Check</Button>
              </div>
            </div>

            {/* Clues */}
            <div>
              <Tabs defaultValue="down">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="across">Across</TabsTrigger>
                  <TabsTrigger value="down">Down</TabsTrigger>
                </TabsList>
                <TabsContent value="across" className="mt-4">
                  <div className="space-y-2">
                    {crosswordData?.words
                      .filter((word) => word.direction === "across")
                      .sort((a, b) => {
                        const aNum = cellNumbers[a.startRow][a.startCol] || 0
                        const bNum = cellNumbers[b.startRow][b.startCol] || 0
                        return aNum - bNum
                      })
                      .map((word, index) => (
                        <div
                          key={index}
                          className={`flex items-start p-1 rounded cursor-pointer ${
                            currentWord === word ? "bg-blue-100" : ""
                          }`}
                          onClick={() => {
                            setSelectedCell([word.startRow, word.startCol])
                            setCurrentDirection("across")
                          }}
                        >
                          <Label className="font-bold mr-2 min-w-[24px]">
                            {cellNumbers[word.startRow][word.startCol]}.
                          </Label>
                          <span>{word.clue}</span>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="down" className="mt-4">
                  <div className="space-y-2">
                    {crosswordData?.words
                      .filter((word) => word.direction === "down")
                      .sort((a, b) => {
                        const aNum = cellNumbers[a.startRow][a.startCol] || 0
                        const bNum = cellNumbers[b.startRow][b.startCol] || 0
                        return aNum - bNum
                      })
                      .map((word, index) => (
                        <div
                          key={index}
                          className={`flex items-start p-1 rounded cursor-pointer ${
                            currentWord === word ? "bg-blue-100" : ""
                          }`}
                          onClick={() => {
                            setSelectedCell([word.startRow, word.startCol])
                            setCurrentDirection("down")
                          }}
                        >
                          <Label className="font-bold mr-2 min-w-[24px]">
                            {cellNumbers[word.startRow][word.startCol]}.
                          </Label>
                          <span>{word.clue}</span>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

