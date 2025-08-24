# DHCP Monitor Pro - Option 50 Tracker

<div align="center">
  <img src="src/assets/logo_colored.png" alt="DHCP Monitor Logo" width="200" height="200">
  <br>
  <h3>Modern DHCP monitoring application with specific Option 50 detection</h3>
  <p>Built with <strong>Tauri</strong>, <strong>React</strong> and <strong>TypeScript</strong> for a cross-platform experience</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-blue.svg)](https://tauri.app/)
  [![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
  [![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
  [![Version](https://img.shields.io/badge/Version-1.1.37-green.svg)](https://github.com/iyotee/DHCPMonitor/releases)
</div>

---

## 🚀 Quick Start

### 📥 Download & Install
- **Windows**: Download `DHCP Monitor Pro_1.1.37_x64-setup.exe` from [Releases](https://github.com/iyotee/DHCPMonitor/releases)
- **macOS**: Download `DHCP Monitor Pro_1.1.37_x64.dmg`
- **Linux**: Download `DHCP Monitor Pro_1.1.37_x64.AppImage`

### 🚀 Run the Application
```bash
# Windows (Run as Administrator)
start.bat

# Linux/macOS (with sudo)
./start.sh
```

---

## ✨ Key Features

- **🔍 Real-time DHCP packet capture** using libpcap
- **🎯 Intelligent Option 50 detection** (Requested IP Address)
- **📊 Live network analytics** and statistics
- **🖥️ Modern cross-platform UI** built with React & Tauri
- **🔒 Administrative privileges** for network interface access
- **📈 Interactive packet analysis** and filtering
- **💾 Data export** capabilities (JSON, CSV)

---

## 📚 Documentation

**📖 For comprehensive documentation, tutorials, and guides, visit our [GitHub Wiki](https://github.com/iyotee/DHCPMonitor/wiki)**

The wiki contains detailed information about:
- 📋 [Installation Guide](https://github.com/iyotee/DHCPMonitor/wiki/Installation)
- ⚙️ [Configuration Options](https://github.com/iyotee/DHCPMonitor/wiki/Configuration)
- 🎯 [Usage Instructions](https://github.com/iyotee/DHCPMonitor/wiki/Usage)
- 🐛 [Troubleshooting Guide](https://github.com/iyotee/DHCPMonitor/wiki/Troubleshooting)
- 🔧 [API Reference](https://github.com/iyotee/DHCPMonitor/wiki/API-Reference)
- 📝 [Contributing Guidelines](https://github.com/iyotee/DHCPMonitor/wiki/Contributing)
- 📋 [Changelog](https://github.com/iyotee/DHCPMonitor/wiki/Changelog)

---

## 🛠️ Development

### Prerequisites
- **Node.js** (v18+)
- **Rust** (v1.70+)
- **Git**
- **Administrative privileges**

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/iyotee/DHCPMonitor.git
cd DHCPMonitor

# Install dependencies
install.bat    # Windows
./install.sh   # Linux/macOS

# Start development
start.bat      # Windows
./start.sh     # Linux/macOS
```

### Build
```bash
# Build application with Npcap DLLs included
build.bat      # Windows
./build.sh     # Linux/macOS
```

---

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri for native performance
- **Network**: libpcap for packet capture
- **Cross-platform**: Windows, macOS, and Linux support

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/iyotee/DHCPMonitor/wiki/Contributing) for details.

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Submit a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Tauri](https://tauri.app/)** - Cross-platform framework
- **[React](https://reactjs.org/)** - User interface
- **[libpcap](https://www.tcpdump.org/)** - Network capture
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling

---

<div align="center">
  <p><strong>DHCP Monitor Pro - Option 50 Tracker</strong></p>
  <p>Modern and performant DHCP monitoring</p>
  <p>⭐ Star this repository if you find it useful!</p>
  <p>📖 <strong>For complete documentation, visit our [Wiki](https://github.com/iyotee/DHCPMonitor/wiki)</strong></p>
</div>
