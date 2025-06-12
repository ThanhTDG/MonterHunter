export const getRandomId = () => {
    let base = Date.now().toString();
    let random = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    while ((base + random).length < 32) {
        random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (base + random).slice(0, 32);
}