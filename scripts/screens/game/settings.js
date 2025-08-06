export function createSettingsScreen() {
    return {
        async render() {
            return `
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-12">
                        <h1>SETTINGS</h1>
                        <p>TODO</p>
                    </div>
                </div>
            `;
        }
    };
}