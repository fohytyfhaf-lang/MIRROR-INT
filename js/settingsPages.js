export const SettingsPages = {

language: `
<div class="settingsCard">

<h2>🌐 Language</h2>

<p>Select the system language.</p>

<div class="settingsRow">
<label for="languageSelect">Language</label>

<select id="languageSelect">
<option value="en">English</option>
<option value="ru">Русский</option>
<option value="ua">Українська</option>
</select>

</div>

<button id="saveLanguage">
Apply
</button>

</div>
`,

appearance: `
<div class="settingsCard">

<h2>🎨 Appearance</h2>

<p>Customize the interface.</p>

<div class="settingsRow">
<label>Animations</label>
<input id="animations" type="checkbox" checked>
</div>

<div class="settingsRow">
<label>CRT Effect</label>
<input id="crt" type="checkbox" checked>
</div>

<div class="settingsRow">
<label>Scanlines</label>
<input id="scanlines" type="checkbox" checked>
</div>

<div class="settingsRow">
<label>Glitch Effects</label>
<input id="glitchEffects" type="checkbox" checked>
</div>

</div>
`,

audio: `
<div class="settingsCard">

<h2>🔊 Audio</h2>

<p>Audio configuration.</p>

<div class="settingsRow">
<label>Master Volume</label>
<input id="masterVolume" type="range" min="0" max="100" value="70">
</div>

<div class="settingsRow">
<label>Music Volume</label>
<input id="musicVolume" type="range" min="0" max="100" value="70">
</div>

<div class="settingsRow">
<label>Effects Volume</label>
<input id="effectsVolume" type="range" min="0" max="100" value="70">
</div>

</div>
`,

interface: `
<div class="settingsCard">

<h2>🖥 Interface</h2>

<p>Interface settings.</p>

<div class="settingsRow">
<label>UI Scale</label>
<input id="uiScale" type="range" min="80" max="140" value="100">
</div>

<div class="settingsRow">
<label>Font Size</label>
<input id="fontSize" type="range" min="12" max="24" value="16">
</div>

</div>
`,

security: `
<div class="settingsCard">

<h2>🔒 Security</h2>

<p>Security settings.</p>

<div class="settingsRow">
<label>Remember User</label>
<input id="rememberUser" type="checkbox">
</div>

<div class="settingsRow">
<label>Auto Login</label>
<input id="autoLogin" type="checkbox">
</div>

<button id="clearData">
Clear Local Data
</button>

</div>
`,

system: `
<div class="settingsCard">

<h2>💾 System</h2>

<p><strong>Version:</strong> OMEGA DEV 0.2</p>
<p><strong>Status:</strong> ONLINE</p>
<p><strong>Environment:</strong> Browser</p>
<p><strong>Storage:</strong> Local Storage</p>

</div>
`,

about: `
<div class="settingsCard">

<h2>ℹ About</h2>

<p><strong>OMEGA SYSTEM</strong></p>

<p>Mirror Intelligence Research Organization</p>

<p>Development Build</p>

<p>Version 0.2</p>

</div>
`

};
