import FlashCardDeck from '@/components/learn/FlashCardDeck'

export default function FlashcardsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-outfit">Ôn tập Flashcard</h1>
        <p className="text-gray-500 mt-2">
          Sử dụng thuật toán Spaced Repetition để ghi nhớ từ vựng lâu hơn.
        </p>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] p-4 sm:p-10 border border-gray-100 shadow-sm">
        <FlashCardDeck />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2">Mẹo nhỏ 💡</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            Đừng cố học quá nhiều một lúc. Hãy ôn tập mỗi ngày 10-15 phút để đạt hiệu quả cao nhất.
          </p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
          <h3 className="font-bold text-indigo-900 mb-2">Chất lượng 📊</h3>
          <p className="text-sm text-indigo-800 leading-relaxed">
            Hãy trung thực với bản thân khi đánh giá mức độ ghi nhớ để AI sắp xếp lịch ôn tập chuẩn xác.
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
          <h3 className="font-bold text-green-900 mb-2">Hứng khởi 🌊</h3>
          <p className="text-sm text-green-800 leading-relaxed">
            Hoàn thành mục tiêu hàng ngày để duy trì chuỗi Streak và nhận thêm nhiều XP!
          </p>
        </div>
      </div>
    </div>
  )
}
