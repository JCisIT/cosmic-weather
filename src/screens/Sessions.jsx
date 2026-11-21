import { BOOKING_URL } from '../content.js'

export default function Sessions() {
  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Sessions</span>
        <h1>Your work with Astra</h1>
      </header>
      <div className="tile">
        <p>After a reading or a 1:1 session, your recap and action steps will appear here, and the action steps will carry into your daily to-do list.</p>
      </div>
      <div className="tile astra">
        <span className="eyebrow gold">Not working with Astra yet?</span>
        <h3>Start with a discovery call</h3>
        <span className="soft">Human Design readings, the Breakthrough Intensive, and 12-week coaching.</span>
        <a className="btn gold" href={BOOKING_URL} target="_blank" rel="noreferrer">Book your discovery call</a>
      </div>
    </>
  )
}
