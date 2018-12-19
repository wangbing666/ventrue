function formatTime(time) {
  if (time < 10) {
    return 0 +  String(time)
  } else {
    return time
  }
}
module.exports = {
  formatTime: formatTime
}
