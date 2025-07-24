document.addEventListener('DOMContentLoaded', () => {
    const piano = document.getElementById('piano');
    const currentNoteDisplay = document.getElementById('current-note');
    const keyHint = document.getElementById('key-hint');
    const demoBtn = document.getElementById('demo-btn');
    const clearBtn = document.getElementById('clear-btn');
    const sustainBtn = document.getElementById('sustain-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    // 创建Web Audio API上下文
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = volumeSlider.value / 100;
    
    // 更新音量
    volumeSlider.addEventListener('input', () => {
        masterGain.gain.value = volumeSlider.value / 100;
    });
    
    // 音符配置（白键和黑键）
    const notes = [
        { note: 'C', type: 'white', key: 'A', octave: '4', label: 'C4', frequency: 261.63 },
        { note: 'C#', type: 'black', key: 'W', octave: '4', label: 'C#4', frequency: 277.18 },
        { note: 'D', type: 'white', key: 'S', octave: '4', label: 'D4', frequency: 293.66 },
        { note: 'D#', type: 'black', key: 'E', octave: '4', label: 'D#4', frequency: 311.13 },
        { note: 'E', type: 'white', key: 'D', octave: '4', label: 'E4', frequency: 329.63 },
        { note: 'F', type: 'white', key: 'F', octave: '4', label: 'F4', frequency: 349.23 },
        { note: 'F#', type: 'black', key: 'T', octave: '4', label: 'F#4', frequency: 369.99 },
        { note: 'G', type: 'white', key: 'G', octave: '4', label: 'G4', frequency: 392.00 },
        { note: 'G#', type: 'black', key: 'Y', octave: '4', label: 'G#4', frequency: 415.30 },
        { note: 'A', type: 'white', key: 'H', octave: '4', label: 'A4', frequency: 440.00 },
        { note: 'A#', type: 'black', key: 'U', octave: '4', label: 'A#4', frequency: 466.16 },
        { note: 'B', type: 'white', key: 'J', octave: '4', label: 'B4', frequency: 493.88 },
        { note: 'C', type: 'white', key: 'K', octave: '5', label: 'C5', frequency: 523.25 }
    ];
    
    // 创建钢琴键盘
    notes.forEach((note, index) => {
        const keyElement = document.createElement('div');
        keyElement.className = `key ${note.type}`;
        keyElement.dataset.note = note.note;
        keyElement.dataset.octave = note.octave;
        keyElement.dataset.key = note.key;
        keyElement.dataset.frequency = note.frequency;
        
        const label = document.createElement('div');
        label.className = 'note-label';
        label.textContent = note.label;
        keyElement.appendChild(label);
        
        // 黑键需要特殊定位
        if (note.type === 'black') {
            keyElement.style.left = `${(index * 7.7) - 4}%`;
        }
        
        piano.appendChild(keyElement);
    });
    
    // 延音效果状态
    let sustainEnabled = false;
    sustainBtn.addEventListener('click', () => {
        sustainEnabled = !sustainEnabled;
        sustainBtn.textContent = sustainEnabled ? "延音开启" : "延音效果";
        sustainBtn.style.background = sustainEnabled ? 
            'linear-gradient(to right, #4facfe, #00f2fe)' : 
            'linear-gradient(to right, #ff7e5f, #feb47b)';
    });
    
    // 播放音符（带真实音效）
    function playNote(note, octave, frequency) {
        // 更新当前音符显示
        currentNoteDisplay.textContent = `${note}${octave}`;
        
        // 更新按键提示
        const keyData = notes.find(n => n.note === note && n.octave === octave);
        if (keyData) {
            keyHint.textContent = `按键: ${keyData.key} (${keyData.label})`;
        }
        
        // 添加激活类以显示视觉效果
        const key = document.querySelector(`.key[data-note="${note}"][data-octave="${octave}"]`);
        if (key) {
            key.classList.add('active');
            setTimeout(() => {
                if (!sustainEnabled) {
                    key.classList.remove('active');
                }
            }, 300);
        }
        
        // 使用Web Audio API生成钢琴音色
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        // 钢琴音色包络
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.8, audioContext.currentTime + 0.01);
        
        if (sustainEnabled) {
            // 延音效果
            gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
        } else {
            // 正常衰减
            gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        oscillator.start();
        
        // 停止振荡器
        setTimeout(() => {
            oscillator.stop();
            if (!sustainEnabled && key) {
                key.classList.remove('active');
            }
        }, sustainEnabled ? 3000 : 1000);
    }
    
    // 鼠标点击事件
    piano.addEventListener('click', (e) => {
        const key = e.target.closest('.key');
        if (key) {
            const note = key.dataset.note;
            const octave = key.dataset.octave;
            const frequency = parseFloat(key.dataset.frequency);
            playNote(note, octave, frequency);
        }
    });
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        // 防止重复触发
        if (e.repeat) return;
        
        const key = e.key.toUpperCase();
        const noteData = notes.find(n => n.key === key);
        
        if (noteData) {
            playNote(noteData.note, noteData.octave, noteData.frequency);
        }
    });
    
    // 演示按钮事件
    demoBtn.addEventListener('click', () => {
        // 播放一段简单的旋律 (小星星)
        const melody = [
            { note: 'C', octave: '4', frequency: 261.63, delay: 0 },
            { note: 'C', octave: '4', frequency: 261.63, delay: 300 },
            { note: 'G', octave: '4', frequency: 392.00, delay: 600 },
            { note: 'G', octave: '4', frequency: 392.00, delay: 900 },
            { note: 'A', octave: '4', frequency: 440.00, delay: 1200 },
            { note: 'A', octave: '4', frequency: 440.00, delay: 1500 },
            { note: 'G', octave: '4', frequency: 392.00, delay: 1800 },
            { note: 'F', octave: '4', frequency: 349.23, delay: 2100 },
            { note: 'F', octave: '4', frequency: 349.23, delay: 2400 },
            { note: 'E', octave: '4', frequency: 329.63, delay: 2700 },
            { note: 'E', octave: '4', frequency: 329.63, delay: 3000 },
            { note: 'D', octave: '4', frequency: 293.66, delay: 3300 },
            { note: 'D', octave: '4', frequency: 293.66, delay: 3600 },
            { note: 'C', octave: '4', frequency: 261.63, delay: 3900 }
        ];
        
        melody.forEach((note, index) => {
            setTimeout(() => {
                playNote(note.note, note.octave, note.frequency);
            }, note.delay);
        });
    });
    
    // 清除按钮事件
    clearBtn.addEventListener('click', () => {
        currentNoteDisplay.textContent = '等待弹奏...';
        keyHint.textContent = '按键盘上的 A 到 K 键弹奏音符';
        
        // 移除所有激活状态
        document.querySelectorAll('.key.active').forEach(key => {
            key.classList.remove('active');
        });
    });
});