export function createRoomsScreen() {
    return {
        async render() {
            return `
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-12">
                        <h1>ROOMS</h1>
                        <p>THERE ARE NO ROOMS CURRENTLY AVAILABLE.</p>
                        <p>START MINING TO BUILD YOUR FIRST ROOM.</p>
                    </div>
                </div>
            `;
        }
    };
}