http://localhost:3000/api?licensePlate=12A05699
{
"licensePlate": "12A05699",
"violations": [
{
"licensePlate": "12A-056.99",
"status": "CHƯA XỬ PHẠT",
"vehicleType": "Ô tô",
"plateColor": "Nền mầu trắng, chữ và số màu đen",
"violationBehavior": "16824.6.9.b.01.không chấp hành hiệu lệnh của đèn tín hiệu giao thông   Xem mức phạt",
"violationTime": "11:25, 08/02/2026",
"violationLocation": "Ngã 4 Vôi, Xã Lạng Giang, Tỉnh Bắc Ninh",
"detectionUnit": "Đội Tuyên truyền, điều tra giải quyết tai nạn, xử lý vi phạm giao thông - Phòng Cảnh sát giao thông - Công an Tỉnh Bắc Ninh",
"resolutionPlaces": []
},
{
"licensePlate": "12A-056.99",
"status": "ĐÃ XỬ PHẠT",
"vehicleType": "Ô tô",
"plateColor": "Nền mầu trắng, chữ và số màu đen",
"violationBehavior": "12321.5.5.a.01.không chấp hành hiệu lệnh của đèn tín hiệu giao thông   Xem mức phạt",
"violationTime": "15:59, 18/04/2024",
"violationLocation": "Km 99+100 QL1A",
"detectionUnit": "Phòng Cảnh sát giao thông - Công an tỉnh Bắc Ninh",
"resolutionPlaces": []
}
]
}

https://tra-cuu-phat-nguoi-tau.vercel.app//api/set-webhook?url=https://tra-cuu-phat-nguoi-tau.vercel.app/

curl -X POST "https://api.telegram.org/bot8408792178:AAF0FxxxxSu_bOw6mGCfw/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://tra-cuu-phat-nguoi-tau.vercel.app//api/set-webhook?url=https://tra-cuu-phat-nguoi-tau.vercel.app/"}'