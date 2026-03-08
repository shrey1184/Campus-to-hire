"""Quick test for Nova Sonic bidirectional streaming."""
import asyncio
import struct
from app.services.voice import voice_service


async def test():
    print("Creating session...")
    session = await voice_service.create_session(
        "You are a friendly assistant. Say hello briefly."
    )
    print(f"Session created. active={session.is_active}")

    await voice_service.start_audio_input(session)
    print("Audio input started")

    # Send 100ms silence (1600 samples at 16kHz)
    silence = struct.pack("<" + "h" * 1600, *([0] * 1600))
    await voice_service.send_audio_chunk(session, silence)
    print("Sent silence")

    await voice_service.end_audio_input(session)
    print("Ended audio, waiting for events...")

    count = 0
    async for evt in voice_service.receive_events(session):
        t = evt.get("type")
        if t == "audio":
            print(f"  audio: {len(evt['data'])} bytes")
        elif t == "transcript":
            print(f"  transcript [{evt['role']}]: {evt['content'][:80]}")
        elif t == "turn_end":
            print("  turn_end")
        elif t == "session_end":
            print("  session_end")
            break
        count += 1
        if count > 50:
            break

    await voice_service.close_session(session)
    print(f"Done. {count} events received.")


if __name__ == "__main__":
    asyncio.run(test())
