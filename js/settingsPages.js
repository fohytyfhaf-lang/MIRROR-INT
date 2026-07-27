export const SettingsPages = {

language: `
<div class="settingsCard">

<h2>🌐 Language</h2>

<p>Choose the system language.</p>

<div class="settingsRow">
<label for="languageSelect">Language</label>

<select id="languageSelect">
<option value="en">English</option>
<option value="ru">Русский</option>
<option value="ua">Українська</option>
</select>

</div>

</div>
`,
  
  audio: `
<div class="settingsCard">

<h2>🔊 Audio</h2>

<div class="settingsRow">

<label>Master Volume</label>

<input
id="masterVolume"
type="range"
min="0"
max="100"
value="70">

</div>

<div class="settingsRow">

<label>Music</label>

<input
id="musicVolume"
type="range"
min="0"
max="100"
value="70">

</div>

<div class="settingsRow">

<label>Effects</label>

<input
id="effectsVolume"
type="range"
min="0"
max="100"
value="80">

</div>

</div>
`,

  interface: `
<div class="settingsCard">

<h2>🖥 Interface</h2>

<div class="settingsRow">

<label>UI Scale</label>

<input
id="uiScale"
type="range"
min="80"
max="140"
value="100">

</div>

<div class="settingsRow">

<label>Font Size</label>

<input
id="fontSize"
type="range"
min="12"
max="24"
value="16">

</div>

</div>
`,

  appearance: `
<div class="settingsCard">

<h2>🎨 Appearance</h2>

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

  security: `
<div class="settingsCard">

<h2>🔒 Security</h2>

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

<p>OMEGA OS DEV 0.2</p>

<p>Status: ONLINE</p>

<p>User: ADMIN</p>

<p>Storage: Local Browser</p>

</div>
`,
  
