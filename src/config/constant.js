exports.STATUS_PENDING = "PENDING";
exports.STATUS_ACCEPTED = "ACCEPTED";
// สร้างตัวแปรเป็นค่าคงที่ไว้ ป้องกันการพิมพ์ผิด เพราะเราจะใช้ค่านี้หลายที่ในโค้ดเรา

/// STATUS มีได้ 5 ค่า ///
exports.AUTH_USER = "AUTH_USER"; //เป็นตัวเอง ตัวเองดูโปรไฟล์ตัวเอง
exports.UNKNOWN = "UNKNOWN"; //ดูโปรไฟล์ของคนที่ยังไม่เคยมีความสัมพันธ์กัน
exports.FRIEND = "FRIEND"; //ดูโปรไฟล์ของคนที่เป็นเพื่อน
exports.REQUESTER = "REQUESTER"; //คนที่ลอคอินดูโปรไฟล์ของคนที่เราขอเป็นเพื่อน
exports.RECEIVER = "RECEIVER"; //คนที่ลอคอินดูโปรไฟล์ของคนที่ขอเราเป็นเพื่อน
