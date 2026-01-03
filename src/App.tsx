import { useState } from 'react'
import './App.css'
import { parseParticipants } from './lib/parseParticipants'
import { shuffle } from './lib/shuffle'

function App() {
  const participants = parseParticipants(import.meta.env.VITE_PARTICIPANTS)
  const hasParticipants = participants.length > 0
  
  // 出席状態を管理（参加者名をキーとしたSet）
  const [attendees, setAttendees] = useState<Set<string>>(new Set())
  const [shuffledOrder, setShuffledOrder] = useState<readonly string[] | null>(null)

  const toggleAttendance = (name: string) => {
    setAttendees(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const handleShuffle = () => {
    const attendeeList = participants.filter(p => attendees.has(p))
    setShuffledOrder(shuffle(attendeeList))
  }

  const attendeeCount = attendees.size
  const canShuffle = hasParticipants && attendeeCount > 0

  return (
    <div className="container">
      <h1>今日の順番</h1>

      {!hasParticipants && (
        <p className="error">環境変数 VITE_PARTICIPANTS が設定されていません。</p>
      )}

      {hasParticipants && (
        <>
          <p className="participants">参加者: {participants.join(' / ')}</p>
          
          <div className="attendance-section">
            <div className="attendance-list">
              {participants.map(name => (
                <div key={name} className="attendance-row">
                  <span className="participant-name">{name}</span>
                  <button
                    className={`attendance-btn ${attendees.has(name) ? 'attended' : ''}`}
                    onClick={() => toggleAttendance(name)}
                  >
                    {attendees.has(name) ? '✓ 出席' : '出席'}
                  </button>
                </div>
              ))}
            </div>
            <p className="attendee-count">出席者: {attendeeCount}人</p>
          </div>
        </>
      )}

      <button 
        onClick={handleShuffle} 
        disabled={!canShuffle}
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
