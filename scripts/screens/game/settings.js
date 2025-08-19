export function createSettingsScreen() {
    return {
        async render() {
            return `
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-12">
                        <h1>SETTINGS</h1>
                        <p><a href="#" data-screen="settings">-> General</a></p>
                        <p><a href="#" data-screen="settings">-> Audio</a></p>
                        <p><a href="#" data-screen="settings">-> Graphics</a></p>
                    </div>
                </div>
            `;
        }
    };
}