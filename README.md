# Vigil-LLM

A powerful Electron-based application that combines text and video language models for comprehensive AI-powered analysis and monitoring.

## 🚀 Features

- **Text LLM Processing**: Advanced text analysis using language models
- **Video Analysis**: Computer vision and video understanding capabilities
- **Electron Desktop App**: Cross-platform desktop application
- **React Frontend**: Modern, responsive user interface
- **Python Backend**: Robust backend processing with Python models
- **Real-time Processing**: Live analysis and monitoring capabilities

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0 or higher)
- **npm** or **yarn**
- **Python** (3.8 or higher)
- **Git**

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VishnuVardhanBR/vigil-llm.git
   cd vigil-llm
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Set up Python environment** (recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

## 🏗️ Project Structure

```
vigil-llm/
├── package.json          # Node.js dependencies and scripts
├── main.js              # Electron main process
├── preload.js           # Electron preload script
├── public/              # Static files
│   └── index.html       # HTML entry point
├── src/                 # React frontend source
│   ├── App.jsx          # Main React component
│   ├── index.css        # Global styles
│   └── index.js         # React entry point
└── backend/             # Python backend
    ├── run_text_llm.py  # Text language model processor
    ├── run_video_model.py # Video analysis processor
    └── assets/          # Static assets
        └── demo_video.mp4 # Demo video file
```

## 🚀 Usage

### Development Mode

1. **Start the Electron application**
   ```bash
   npm start
   ```

2. **Test Python backends** (in separate terminals)
   
   Text LLM:
   ```bash
   python backend/run_text_llm.py "Your text query here"
   ```
   
   Video Model:
   ```bash
   python backend/run_video_model.py backend/assets/demo_video.mp4 "What's in this video?"
   ```

### Production Build

```bash
npm run build
npm run dist
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Add your configuration here
PYTHON_PATH=python3
MODEL_PATH=./models
DEBUG=true
```

### Python Dependencies

Create a `requirements.txt` file for Python dependencies:

```txt
# Add your Python dependencies here
# Example:
# torch>=1.9.0
# transformers>=4.0.0
# opencv-python>=4.5.0
# numpy>=1.21.0
```

## 📚 API Reference

### Text LLM Backend

The `run_text_llm.py` script processes text queries:

```bash
python backend/run_text_llm.py "Your question here"
```

**Response Format:**
```json
{
  "response": "Processed response",
  "status": "success",
  "model": "text-llm"
}
```

### Video Model Backend

The `run_video_model.py` script analyzes video content:

```bash
python backend/run_video_model.py path/to/video.mp4 "Optional query"
```

**Response Format:**
```json
{
  "video_path": "path/to/video.mp4",
  "analysis": "Video analysis results",
  "status": "success",
  "model": "video-model",
  "query": "Optional query",
  "answer": "Answer to the query"
}
```

## 🛠️ Development

### Adding New Features

1. **Frontend Changes**: Edit files in the `src/` directory
2. **Backend Changes**: Modify Python scripts in the `backend/` directory
3. **Electron Changes**: Update `main.js` or `preload.js`

### Code Style

- **JavaScript/React**: Follow standard React conventions
- **Python**: Follow PEP 8 guidelines
- **Electron**: Follow Electron best practices

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run Python tests
python -m pytest backend/tests/

# Run Electron tests
npm run test:electron
```

## 📦 Building for Production

### Windows
```bash
npm run build:win
```

### macOS
```bash
npm run build:mac
```

### Linux
```bash
npm run build:linux
```

## 🐛 Troubleshooting

### Common Issues

1. **Python Path Issues**: Ensure Python is in your PATH and virtual environment is activated
2. **Node Module Issues**: Try deleting `node_modules` and running `npm install` again
3. **Electron Issues**: Make sure you have the latest Electron version

### Debug Mode

Enable debug logging:
```bash
DEBUG=true npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Contact: [your-email@example.com](mailto:your-email@example.com)
- Documentation: [Project Wiki](https://github.com/VishnuVardhanBR/vigil-llm/wiki)

## 🎯 Roadmap

- [ ] Enhanced video processing capabilities
- [ ] Support for more LLM models
- [ ] Real-time monitoring features
- [ ] Cloud deployment options
- [ ] Mobile application companion

---

**Built with ❤️ by [Vishnu Vardhan](https://github.com/VishnuVardhanBR)**