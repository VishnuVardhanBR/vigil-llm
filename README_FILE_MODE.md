# Video File Analysis Mode

This version of Vigil-LLM has been modified to work with pre-recorded video files instead of live webcam capture for demonstration purposes.

## Changes Made

### Frontend Changes
1. **Configure Component**: 
   - Replaced webcam capture with file upload functionality
   - Added video file selection with drag-and-drop support
   - Frame capture for zone definition works with uploaded videos

2. **Home Component**:
   - Video player instead of live webcam feed
   - Play/pause controls during monitoring
   - Periodic analysis of video content at current playback position

3. **Context Management**:
   - Added `videoFile` state to ZoneContext for sharing uploaded files

### Backend Changes
1. **Main Process** (`electron/main.js`):
   - Added new IPC handler `video-file-analysis` for processing uploaded files
   - Refactored video analysis into shared `processVideoAnalysis` function
   - Supports both live chunks and file-based analysis

2. **Preload Script** (`electron/preload.js`):
   - Added `sendVideoForAnalysis` API for file-based processing

## How It Works

1. **Upload Phase**: User selects a video file in the Configure section
2. **Zone Definition**: Optional safety zone can be defined on a captured video frame
3. **Analysis Phase**: During monitoring, the system:
   - Plays the video file
   - Periodically captures the current frame for analysis (every 5 seconds)
   - Sends the entire video file with timestamp to the backend
   - Uses the existing VideoMAE model for activity recognition
   - Applies the same AI decision-making process for alerts

## Usage Instructions

1. Go to the Configure section
2. Click "Upload Video File" and select a video (MP4, AVI, MOV, WEBM)
3. Optionally define a safety zone by clicking 4 points on the video frame
4. Navigate to Home and set your monitoring goal
5. Click Continue to start analysis
6. The video will play automatically and analysis will occur every 5 seconds

## Supported Video Formats

- MP4
- AVI
- MOV
- WEBM
- MKV

## Demo Video Suggestions

For demonstration purposes, you can use any video containing:
- People moving around (for activity detection)
- Different scenarios (indoor/outdoor, day/night)
- Various activities (sitting, walking, running, etc.)

## Technical Notes

- The system maintains the same VideoMAE analysis pipeline
- Zone detection coordinates are properly scaled for different video resolutions
- Playback control allows pausing/resuming analysis
- All existing AI context and alert logic remains unchanged