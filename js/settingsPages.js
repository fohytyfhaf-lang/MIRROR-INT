export const SettingsPages = {

language: `
<div class="settingsCard">

<h2>LANGUAGE</h2>

<p>Select system language.</p>

<div class="settingsRow">

<span>Language</span>

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

<h2>DISPLAY</h2>

<p>Display configuration.</p>

<div class="settingsRow">
<span>Animations</span>
<div class="switch active"></div>
</div>

<div class="settingsRow">
<span>Scanlines</span>
<div class="switch active"></div>
</div>

<div class="settingsRow">
<span>CRT Effect</span>
<div class="switch active"></div>
</div>

</div>
`,

audio: `
<div class="settingsCard">

<h2>AUDIO</h2>

<p>System sound configuration.</p>

<div class="settingsRow">

<span>Volume</span>

<input type="range" min="0" max="100" value="70">

</div>

</div>
`,

security: `
<div class="settingsCard">

<h2>SECURITY</h2>

<p>Security options.</p>

<div class="settingsRow">

<span>Auto Lock</span>

<div class="switch"></div>

</div>

</div>
`,

system: `
<div class="settingsCard">

<h2>SYSTEM</h2>

<p>OMEGA Operating Environment</p>

<p>Version 0.2 DEV</p>

</div>
`

};
