import { useState } from 'react'
import './App.css'
import { parseParticipants } from './lib/parseParticipants'
import { shuffle } from './lib/shuffle'

function App() {
  const participants = parseParticipants(import.meta.env.VITE_PARTICIPANTS)
  const hasParticipants = participants.length > 0
  
  const [shuffledOrder, setShuffledOrder] = useState<readonly string[] | null>(null)

  const handleShuffle = () => {
    setShuffledOrder(shuffle(participants))
  }

  return (
    <div className="container">
      <h1>今日の順番</h1>

      {!hasParticipants && (
        <p className="error">環境変数 VITE_PARTICIPANTS が設定されていません。</p>
      )}

      {hasParticipants && (
        <p className="participants">参加者: {participants.join(' / ')}</p>
      )}

      <button 
        onClick={handleShuffle} 
        disabled={!hasParticipants}
      >
        順番を決める
      </button>

      <div className="result">
        {shuffledOrder === null ? (
          <p>まだ順番が決まっていません。</p>
        ) : (
          <>
            <p>今日の発表順:</p>
            <ol>
              {shuffledOrder.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  )
}

export default App
