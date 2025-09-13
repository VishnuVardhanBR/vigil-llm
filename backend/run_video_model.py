# ---------------------------------------------------------------------
# Copyright (c) 2025 Qualcomm Technologies, Inc. and/or its subsidiaries.
# SPDX-License-Identifier: BSD-3-Clause
#
# Modified for integration with the Electron Baby Monitor App.
# ---------------------------------------------------------------------

import sys
from qai_hub_models.models.video_mae.app import VideoMAEApp

# --- Constants ---
# We need the top 5 predictions for the text LLM to analyze.
TOP_K_PREDICTIONS = 5

def run_inference(video_path: str) -> str:
    """
    Initializes the VideoMAEApp and predicts actions from a video file.

    Args:
        video_path: The local file path to the video to be analyzed.

    Returns:
        A comma-separated string of the top 5 predicted action labels.
    """
    print(f"Loading VideoMAE model for video: {video_path}", file=sys.stderr)
    # The app class provides a high-level API for running the model.
    # This will load the model from the local cache.
    app = VideoMAEApp.from_precompiled()
    print("Model loaded. Predicting actions...", file=sys.stderr)

    # The app's predict method runs the full inference pipeline.
    # It returns a dictionary of { "class_name": probability }.
    predictions = app.predict(video_path, top_k=TOP_K_PREDICTIONS)

    # Extract just the class names (the keys of the dictionary).
    top_predictions = list(predictions.keys())

    # Format the predictions into a single comma-separated string for the Node.js process.
    output_string = ", ".join(top_predictions)
    
    print(f"Predictions: {output_string}", file=sys.stderr)
    return output_string


def main():
    """
    Main function to handle command-line arguments and execute the model.
    """
    if len(sys.argv) < 2:
        print("Error: Missing video file path argument.", file=sys.stderr)
        print("Usage: python run_video_model.py <path_to_video>", file=sys.stderr)
        sys.exit(1)

    video_path = sys.argv[1]

    try:
        # Run inference and get the predictions.
        output = run_inference(video_path)
        # Print the final string to stdout for Node.js to capture.
        print(output)
    except Exception as e:
        print(f"An error occurred during video model inference: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
