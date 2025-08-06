export function createPersonnelScreen() {
    return {
        async render() {
            return `
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-12">
                        <h1>PERSONNEL</h1>
                        <p>THERE IS NO PERSONNEL CURRENTLY AVAILABLE FOR WORK USE.</p>
                    </div>
                </div>
            `;
        }
    };
}