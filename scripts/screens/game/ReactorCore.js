export function createReactorCoreScreen() {
    return {
        async render() {
            return `
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-12">
                        <h1>REACTOR CORE</h1>
                        <p>The reactor is still not in use.</p>
                    </div>
                </div>
            `;
        }
    };
}