/* Live layer: cross-tab realtime for bids, Q&A chat, and polls.
   Vercel hosts static builds (no WebSocket server), so tabs sync over
   BroadcastChannel — the same protocol shape a socket server would fan out. */
import { useShark, type Bid, type ChatMsg, type Poll } from "./store";

export type LiveMsg =
  | { kind: "bid"; bid: Bid }
  | { kind: "chat"; msg: ChatMsg }
  | { kind: "poll"; poll: Poll }
  | { kind: "vote"; pollId: string; option: string; voter: string }
  | { kind: "poll-close"; pollId: string };

let ch: BroadcastChannel | null = null;

export function livePublish(m: LiveMsg) {
  try {
    ch?.postMessage(m);
  } catch {
    /* channel unavailable — single-tab fallback */
  }
}

function apply(m: LiveMsg) {
  const s = useShark.getState();
  switch (m.kind) {
    case "bid":
      s.ingestBid(m.bid);
      break;
    case "chat":
      s.addChat({ ...m.msg, mine: false });
      break;
    case "poll":
      if (!s.polls.some((p) => p.id === m.poll.id)) useShark.setState({ polls: [...s.polls, m.poll] });
      break;
    case "vote":
      s.votePoll(m.pollId, m.option, m.voter);
      break;
    case "poll-close":
      s.closePoll(m.pollId);
      break;
  }
}

export function initLive() {
  if (ch || typeof BroadcastChannel === "undefined") return;
  ch = new BroadcastChannel("tyniotank-live");
  ch.onmessage = (e) => {
    if (e.data && typeof e.data === "object" && "kind" in e.data) apply(e.data as LiveMsg);
  };
}
