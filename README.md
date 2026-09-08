# WritingAssistant

<div align="center">

**🌐 Choisissez votre langue / Choose your language / 选择语言**

[🇫🇷 Français](#-français) | [🇬🇧 English](#-english) | [🇨🇳 中文](#-中文)

</div>

---

## 🇫🇷 Français

<details open>
<summary><strong>📖 Table des matières</strong></summary>

- [📝 Description](#-description)
- [✨ Fonctionnalités principales](#-fonctionnalités-principales)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#-configuration)
  - [Bring Your Own Key (BYOK)](#bring-your-own-key-byok)
  - [Endpoints API](#endpoints-api)
- [📚 Utilisation](#-utilisation)
  - [Gestion de projets](#gestion-de-projets)
  - [Éditeur de texte](#éditeur-de-texte)
  - [Système de notes](#système-de-notes)
  - [Commandes slash](#commandes-slash)
  - [Agent IA](#agent-ia)
- [🎨 Personnalisation](#-personnalisation)
  - [Thèmes](#thèmes)
  - [Modes d'animation](#modes-danimation)
  - [Langues](#langues)
- [🔧 Technologies](#-technologies)

</details>

### 📝 Description

WritingAssistant est une application de rédaction assistée par intelligence artificielle, conçue pour les auteurs, romanciers, scientifiques et créateurs de contenu. Elle combine un éditeur de texte avancé avec des capacités d'IA puissantes pour vous aider à écrire, organiser et développer vos projets littéraires.

L'application utilise une interface moderne de type "liquid glass" avec des animations fluides et un design responsive, offrant une expérience d'écriture immersive et productive.

### ✨ Fonctionnalités principales

- **Éditeur intelligent** avec suggestions en temps réel
- **Agent IA** avec outils spécialisés (résumé, développement, correction, analyse)
- **Système de notes structuré** pour maintenir la cohérence de vos histoires
- **Commandes slash** pour des actions rapides
- **Gestion de projets** avec dossiers, chapitres et tags
- **RAG (Retrieval Augmented Generation)** pour un contexte enrichi
- **Mémoire par projet et par chapitre**
- **Drag & drop** pour réorganiser les chapitres
- **Différentiels visuels** pour voir les modifications de l'IA
- **Multilingue** (Français, Anglais, Chinois, Allemand, Japonais)
- **Thèmes** clair, sombre et automatique
- **Modes d'animation** configurables (Aucune, Peu, Plus, Tout, Chaos, Personnalisé)
- **Effets sonores** interactifs
- **Export** de documents

### 🚀 Installation

```bash
# Cloner le dépôt
git clone <repository-url>
cd WritingAssistant

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Construire pour la production
npm run build
```

### ⚙️ Configuration

#### Bring Your Own Key (BYOK)

WritingAssistant utilise le modèle BYOK (Bring Your Own Key). Vous devez fournir vos propres clés API pour utiliser les fonctionnalités d'IA.

1. Ouvrez les **Paramètres** (icône ⚙️)
2. Configurez les endpoints et clés API :
   - **Endpoint Inline** : pour les suggestions en temps réel
   - **Endpoint Agent** : pour l'agent IA et les outils
   - **Clés API** : vos clés d'authentification
3. Cliquez sur **"Charger les modèles"** pour découvrir les modèles disponibles

#### Endpoints API

L'application est compatible avec tout endpoint OpenAI-compatible :
- OpenAI API
- Azure OpenAI
- Anthropic Claude (via proxy compatible)
- Ollama (local)
- Tout autre service compatible OpenAI

### 📚 Utilisation

#### Gestion de projets

1. **Créer un projet** : Cliquez sur "Nouveau Projet" dans la barre latérale
2. **Organiser** : Créez des dossiers pour structurer votre travail
3. **Chapitres** : Ajoutez des chapitres dans chaque dossier
4. **Tags** : Ajoutez des tags aux projets, dossiers et chapitres
5. **Recherche** : Utilisez la barre de recherche pour naviguer rapidement
6. **Drag & drop** : Réorganisez les chapitres en les faisant glisser

#### Éditeur de texte

L'éditeur offre :
- **Suggestions en temps réel** : L'IA suggère du texte pendant que vous écrivez
  - Appuyez sur `Tab` pour accepter le prochain mot
  - Appuyez sur `Ctrl+Enter` pour tout accepter
  - Appuyez sur `Esc` pour rejeter
- **Titre éditable** : Cliquez sur le titre pour le modifier
- **Compteur de mots/caractères** : Affiché en haut de l'éditeur
- **Export** : Bouton pour exporter en .txt

#### Système de notes

Le système de notes vous aide à maintenir la cohérence de vos histoires :

1. **Vue d'ensemble** : Informations générales du projet
   - Prémisse, genre, ton
   - Thèmes, cadre, résumé
   - Règles du monde, audience, objectifs

2. **Personnages** : Fiches détaillées
   - Nom, alias, âge, apparence
   - Personnalité, background
   - Objectifs, peurs, relations
   - Conflits, développement

3. **Lieux** : Description des environnements
   - Nom, type, disposition
   - Atmosphère, histoire
   - Habitants, objets importants
   - Événements, règles

4. **Moments** : Événements clés
   - Titre, description, type
   - Timing, durée
   - Conséquences
   - Liens avec personnages/lieux

Accédez aux notes via l'icône 📝 dans la barre supérieure.

#### Commandes slash

Tapez `/` n'importe où dans le texte pour accéder aux commandes :

- `/developper` : Développer le texte avec une instruction
- `/resume` : Résumer le contenu
- `/corriger` : Corriger grammaire et orthographe
- `/reecrire` : Réécrire dans un style différent
- `/analyser` : Analyser le style et la structure
- `/idees` : Générer des idées pour la suite
- `/plan` : Générer un plan de section
- `/traduire` : Traduire le texte
- `/personnage` : Créer un personnage
- `/lieu` : Décrire un lieu

Chaque commande ouvre une zone de texte pour écrire votre instruction spécifique.

#### Agent IA

L'agent IA peut :
- **Résumer** le document actuel
- **Développer** et enrichir le texte
- **Réécrire** dans un style différent
- **Corriger** les fautes
- **Analyser** la structure et les thèmes
- **Rechercher** dans le contexte du projet
- **Créer des notes** (personnages, lieux, moments)

L'agent a accès à :
- Tous les documents du projet
- Les notes (Overview, Characters, Places, Moments)
- Le contexte RAG indexé
- La mémoire du chapitre actuel

### 🎨 Personnalisation

#### Thèmes

- **Clair** : Fond bleu clair et vert menthe
- **Sombre** : Fond bleu nuit et vert émeraude
- **Auto** : S'adapte automatiquement aux préférences système

#### Modes d'animation

- **Aucune** : Pas d'animations
- **Peu** : Animations minimales
- **Plus** : Animations modérées avec icônes animées
- **Tout** : Toutes les animations activées
- **Chaos** : Animations extrêmes (avec confirmation)
- **Personnalisé** : Choisissez quelles animations activer
  - Particules d'arrière-plan
  - Effets de survol
  - Transitions
  - Animations d'entrée
  - Feedback visuel
  - Micro-interactions
  - Icônes animées

#### Langues

L'interface est disponible en :
- 🇫🇷 Français
- 🇪🇸 Español
- 🇨🇳 中文
- 🇩🇪 Deutsch
- 🇯🇵 日本語

Changez la langue via l'icône 🌐 dans la barre supérieure.

### 🔧 Technologies

- **React** + **TypeScript**
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **Web Audio API** pour les effets sonores
- **LocalStorage** pour la persistance des données

---

## 🇬🇧 English

<details open>
<summary><strong>📖 Table of Contents</strong></summary>

- [📝 Description](#-description-1)
- [✨ Main Features](#-main-features)
- [🚀 Installation](#-installation-1)
- [⚙️ Configuration](#-configuration-1)
  - [Bring Your Own Key (BYOK)](#bring-your-own-key-byok-1)
  - [API Endpoints](#api-endpoints)
- [📚 Usage](#-usage)
  - [Project Management](#project-management)
  - [Text Editor](#text-editor)
  - [Notes System](#notes-system)
  - [Slash Commands](#slash-commands)
  - [AI Agent](#ai-agent)
- [🎨 Customization](#-customization)
  - [Themes](#themes)
  - [Animation Modes](#animation-modes)
  - [Languages](#languages)
- [🔧 Technologies](#-technologies-1)

</details>

### 📝 Description

WritingAssistant is an AI-powered writing application designed for authors, novelists, scientists, and content creators. It combines an advanced text editor with powerful AI capabilities to help you write, organize, and develop your literary projects.

The application uses a modern "liquid glass" interface with smooth animations and responsive design, offering an immersive and productive writing experience.

### ✨ Main Features

- **Smart editor** with real-time suggestions
- **AI agent** with specialized tools (summary, expansion, correction, analysis)
- **Structured notes system** to maintain story consistency
- **Slash commands** for quick actions
- **Project management** with folders, chapters, and tags
- **RAG (Retrieval Augmented Generation)** for enriched context
- **Per-project and per-chapter memory**
- **Drag & drop** to reorganize chapters
- **Visual diffs** to see AI modifications
- **Multilingual** (French, English, Chinese, German, Japanese)
- **Themes**: light, dark, and automatic
- **Animation modes** (None, Few, More, All, Chaos, Custom)
- **Interactive sound effects**
- **Document export**

### 🚀 Installation

```bash
# Clone the repository
git clone <repository-url>
cd WritingAssistant

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

### ⚙️ Configuration

#### Bring Your Own Key (BYOK)

WritingAssistant uses the BYOK (Bring Your Own Key) model. You need to provide your own API keys to use AI features.

1. Open **Settings** (⚙️ icon)
2. Configure endpoints and API keys:
   - **Inline Endpoint**: for real-time suggestions
   - **Agent Endpoint**: for AI agent and tools
   - **API Keys**: your authentication keys
3. Click **"Load models"** to discover available models

#### API Endpoints

The application is compatible with any OpenAI-compatible endpoint:
- OpenAI API
- Azure OpenAI
- Anthropic Claude (via compatible proxy)
- Ollama (local)
- Any other OpenAI-compatible service

### 📚 Usage

#### Project Management

1. **Create a project**: Click "New Project" in the sidebar
2. **Organize**: Create folders to structure your work
3. **Chapters**: Add chapters in each folder
4. **Tags**: Add tags to projects, folders, and chapters
5. **Search**: Use the search bar for quick navigation
6. **Drag & drop**: Reorganize chapters by dragging them

#### Text Editor

The editor offers:
- **Real-time suggestions**: AI suggests text as you write
  - Press `Tab` to accept the next word
  - Press `Ctrl+Enter` to accept all
  - Press `Esc` to reject
- **Editable title**: Click the title to modify it
- **Word/character counter**: Displayed at the top of the editor
- **Export**: Button to export as .txt

#### Notes System

The notes system helps you maintain story consistency:

1. **Overview**: General project information
   - Premise, genre, tone
   - Themes, setting, summary
   - World rules, audience, goals

2. **Characters**: Detailed profiles
   - Name, aliases, age, appearance
   - Personality, background
   - Goals, fears, relationships
   - Conflicts, development

3. **Places**: Environment descriptions
   - Name, type, layout
   - Atmosphere, history
   - Inhabitants, important objects
   - Events, rules

4. **Moments**: Key events
   - Title, description, type
   - Timing, duration
   - Consequences
   - Links to characters/places

Access notes via the 📝 icon in the top bar.

#### Slash Commands

Type `/` anywhere in the text to access commands:

- `/develop` : Expand the text with an instruction
- `/summarize` : Summarize the content
- `/correct` : Fix grammar and spelling
- `/rewrite` : Rewrite in a different style
- `/analyze` : Analyze style and structure
- `/ideas` : Generate ideas for continuation
- `/outline` : Generate a section outline
- `/translate` : Translate the text
- `/character` : Create a character
- `/place` : Describe a place

Each command opens a text area to write your specific instruction.

#### AI Agent

The AI agent can:
- **Summarize** the current document
- **Expand** and enrich the text
- **Rewrite** in a different style
- **Correct** mistakes
- **Analyze** structure and themes
- **Search** in project context
- **Create notes** (characters, places, moments)

The agent has access to:
- All project documents
- Notes (Overview, Characters, Places, Moments)
- Indexed RAG context
- Current chapter memory

### 🎨 Customization

#### Themes

- **Light**: Light blue and mint green background
- **Dark**: Midnight blue and emerald green background
- **Auto**: Automatically adapts to system preferences

#### Animation Modes

- **None**: No animations
- **Few**: Minimal animations
- **More**: Moderate animations with animated icons
- **All**: All animations enabled
- **Chaos**: Extreme animations (with confirmation)
- **Custom**: Choose which animations to enable
  - Background particles
  - Hover effects
  - Transitions
  - Entrance animations
  - Visual feedback
  - Micro-interactions
  - Animated icons

#### Languages

The interface is available in:
- 🇫🇷 French
- 🇪🇸 Spanish
- 🇨🇳 Chinese
- 🇩🇪 German
- 🇯🇵 Japanese

Change the language via the 🌐 icon in the top bar.

### 🔧 Technologies

- **React** + **TypeScript**
- **Vite** for building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Web Audio API** for sound effects
- **LocalStorage** for data persistence

---

## 🇨🇳 中文

<details open>
<summary><strong>📖 目录</strong></summary>

- [📝 描述](#-描述)
- [✨ 主要功能](#-主要功能)
- [🚀 安装](#-安装)
- [⚙️ 配置](#-配置)
  - [自带密钥 (BYOK)](#自带密钥-byok)
  - [API 端点](#api-端点)
- [📚 使用方法](#-使用方法)
  - [项目管理](#项目管理)
  - [文本编辑器](#文本编辑器)
  - [笔记系统](#笔记系统)
  - [斜杠命令](#斜杠命令)
  - [AI 代理](#ai-代理)
- [🎨 自定义](#-自定义)
  - [主题](#主题)
  - [动画模式](#动画模式)
  - [语言](#语言)
- [🔧 技术栈](#-技术栈)

</details>

### 📝 描述

WritingAssistant 是一款由人工智能驱动的专业写作应用，专为作家、小说家、科学家和内容创作者设计。它将高级文本编辑器与强大的 AI 功能相结合，帮助您编写、组织和开发文学项目。

该应用采用现代化的"液态玻璃"界面，具有流畅的动画和响应式设计，提供沉浸式且高效的写作体验。

### ✨ 主要功能

- **智能编辑器**：实时建议功能
- **AI 代理**：专业工具（摘要、扩展、纠正、分析）
- **结构化笔记系统**：保持故事一致性
- **斜杠命令**：快速操作
- **项目管理**：文件夹、章节和标签
- **RAG（检索增强生成）**：丰富的上下文
- **项目和章节记忆**
- **拖放功能**：重新组织章节
- **可视化差异**：查看 AI 修改
- **多语言支持**（法语、英语、中文、德语、日语）
- **主题**：浅色、深色和自动
- **动画模式**（无、少量、更多、全部、混乱、自定义）
- **交互式音效**
- **文档导出**

### 🚀 安装

```bash
# 克隆仓库
git clone <repository-url>
cd WritingAssistant

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 生产构建
npm run build
```

### ⚙️ 配置

#### 自带密钥 (BYOK)

WritingAssistant 使用 BYOK（自带密钥）模式。您需要提供自己的 API 密钥才能使用 AI 功能。

1. 打开**设置**（⚙️ 图标）
2. 配置端点和 API 密钥：
   - **内联端点**：用于实时建议
   - **代理端点**：用于 AI 代理和工具
   - **API 密钥**：您的身份验证密钥
3. 点击**"加载模型"**以发现可用模型

#### API 端点

该应用兼容任何 OpenAI 兼容端点：
- OpenAI API
- Azure OpenAI
- Anthropic Claude（通过兼容代理）
- Ollama（本地）
- 任何其他 OpenAI 兼容服务

### 📚 使用方法

#### 项目管理

1. **创建项目**：点击侧边栏中的"新项目"
2. **组织**：创建文件夹以构建工作结构
3. **章节**：在每个文件夹中添加章节
4. **标签**：为项目、文件夹和章节添加标签
5. **搜索**：使用搜索栏快速导航
6. **拖放**：通过拖动重新组织章节

#### 文本编辑器

编辑器提供：
- **实时建议**：AI 在您写作时建议文本
  - 按 `Tab` 接受下一个词
  - 按 `Ctrl+Enter` 全部接受
  - 按 `Esc` 拒绝
- **可编辑标题**：点击标题进行修改
- **字数/字符计数器**：显示在编辑器顶部
- **导出**：导出为 .txt 的按钮

#### 笔记系统

笔记系统帮助您保持故事一致性：

1. **概述**：项目基本信息
   - 前提、类型、基调
   - 主题、背景、摘要
   - 世界规则、受众、目标

2. **角色**：详细档案
   - 姓名、别名、年龄、外貌
   - 个性、背景
   - 目标、恐惧、关系
   - 冲突、发展

3. **地点**：环境描述
   - 名称、类型、布局
   - 氛围、历史
   - 居民、重要物品
   - 事件、规则

4. **时刻**：关键事件
   - 标题、描述、类型
   - 时间、持续时间
   - 后果
   - 与角色/地点的联系

通过顶部栏的 📝 图标访问笔记。

#### 斜杠命令

在文本中的任意位置输入 `/` 以访问命令：

- `/develop`：根据指令扩展文本
- `/summarize`：总结内容
- `/correct`：修正语法和拼写
- `/rewrite`：以不同风格重写
- `/analyze`：分析风格和结构
- `/ideas`：为续写生成想法
- `/outline`：生成章节大纲
- `/translate`：翻译文本
- `/character`：创建角色
- `/place`：描述地点

每个命令都会打开一个文本区域来编写您的具体指令。

#### AI 代理

AI 代理可以：
- **总结**当前文档
- **扩展**和丰富文本
- **重写**为不同风格
- **纠正**错误
- **分析**结构和主题
- **搜索**项目上下文
- **创建笔记**（角色、地点、时刻）

代理可以访问：
- 所有项目文档
- 笔记（概述、角色、地点、时刻）
- 索引的 RAG 上下文
- 当前章节记忆

### 🎨 自定义

#### 主题

- **浅色**：浅蓝色和薄荷绿背景
- **深色**：午夜蓝和翡翠绿背景
- **自动**：自动适应系统偏好

#### 动画模式

- **无**：无动画
- **少量**：最小动画
- **更多**：适度动画，带动态图标
- **全部**：启用所有动画
- **混乱**：极端动画（需确认）
- **自定义**：选择启用哪些动画
  - 背景粒子
  - 悬停效果
  - 过渡效果
  - 入场动画
  - 视觉反馈
  - 微交互
  - 动态图标

#### 语言

界面提供以下语言：
- 🇫🇷 法语
- 🇪🇸 西班牙语
- 🇨🇳 中文
- 🇩🇪 德语
- 🇯🇵 日语

通过顶部栏的 🌐 图标更改语言。

### 🔧 技术栈

- **React** + **TypeScript**
- **Vite**：构建工具
- **Tailwind CSS**：样式框架
- **Lucide React**：图标库
- **Web Audio API**：音效
- **LocalStorage**：数据持久化

---

<div align="center">

**🌐 返回语言选择 / Back to language selection / 返回语言选择**

[🇫🇷 Français](#-français) | [🇬🇧 English](#-english) | [🇨🇳 中文](#-中文)

</div>
