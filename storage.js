export const Storage = {
  get(key, fallback = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
{
  admin: {
    password: "0000",
    settings: {
      language: "en",
      volume: 0.4

      operator:{
        password: "0404",
    settings: {
      language: "en",
      volume: 0.4
    }
  }
}
{
