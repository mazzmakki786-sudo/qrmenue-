export const PAKISTAN_CITIES = [
  // Provinces: Punjab
  "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot",
  "Bahawalpur", "Sargodha", "Sheikhupura", "Rahim Yar Khan", "Jhang",
  "Dera Ghazi Khan", "Gujrat", "Sahiwal", "Wah Cantonment", "Kasur",
  "Okara", "Chiniot", "Mandi Bahauddin", "Hafizabad", "Khanewal",
  "Muzaffargarh", "Vehari", "Pakpattan", "Bahawalnagar", "Layyah",
  "Bhakkar", "Khushab", "Mianwali", "Jhelum", "Chakwal", "Attock",
  "Narowal", "Nankana Sahib", "Toba Tek Singh", "Lodhran", "Khanpur",
  "Hasilpur", "Haroonabad", "Yazman", "Ahmedpur East", "Jalalpur Pirwala",
  "Shorkot", "Kamalia", "Kabirwala", "Arifwala", "Burewala", "Mailsi",
  "Chishtian", "Dunyapur", "Qadirpur Ran", "Jatoi", "Alipur", "Kot Addu",
  "Taunsa", "Dajal", "Rajanpur", "Fateh Jang", "Talagang", "Pind Dadan Khan",
  "Kallar Kahar", "Choa Saidan Shah",

  // Province: Sindh
  "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas",
  "Khairpur", "Dadu", "Jacobabad", "Shikarpur", "Tando Allahyar",
  "Tando Muhammad Khan", "Thatta", "Badin", "Umerkot", "Sanghar",
  "Ghotki", "Kashmore", "Qambar Shahdadkot", "Naushahro Feroze",
  "Matiari", "Jamshoro", "Kotri", "Sehwan", "Ranipur", "Moro",
  "Hala", "Khipro", "Mithi", "Chhor", "Diplo", "Islamkot",

  // Province: Khyber Pakhtunkhwa
  "Peshawar", "Abbottabad", "Mardan", "Swat", "Kohat", "Bannu",
  "Dera Ismail Khan", "Charsadda", "Nowshera", "Mansehra", "Haripur",
  "Batgram", "Karak", "Hangu", "Lakki Marwat", "Tank", "Shangla",
  "Buner", "Swabi", "Malakand", "Dir", "Chitral", "Upper Dir",
  "Lower Dir", "Kohistan", "Torghar", "Kolai Palas", "Kurram",
  "North Waziristan", "South Waziristan", "Orakzai", "Khyber",
  "Bajaur", "Mohanad", "Timergara", "Saidu Sharif", "Mingora",
  "Barikot", "Kalam", "Madyan", "Tahkht-e-Nasrati",

  // Province: Balochistan
  "Quetta", "Gwadar", "Turbat", "Khuzdar", "Chaman", "Sibi",
  "Zhob", "Loralai", "Dera Murad Jamali", "Ziarat", "Nushki",
  "Dalbandin", "Panjgur", "Pasni", "Ormara", "Jiwani",
  "Mastung", "Kalat", "Mekhtar", "Washuk", "Kech", "Awaran",
  "Lasbela", "Hub", "Bela", "Harnai", "Duki", "Sohbatpur",
  "Jafarabad", "Nasirabad", "Bolan", "Killa Abdullah", "Killa Saifullah",
  "Pishin", "Qila Saifullah",

  // Territory: Islamabad Capital Territory
  "Islamabad",

  // Territory: Gilgit-Baltistan
  "Gilgit", "Skardu", "Hunza", "Nagar", "Ghanche", "Shigar",
  "Kharmang", "Astore", "Diamer", "Ghizer", "Gupis-Yasin",
  "Tangir", "Khaplu", "Aliabad", "Karimabad",

  // Territory: Azad Jammu & Kashmir
  "Muzaffarabad", "Mirpur", "Rawalakot", "Kotli", "Bhimber",
  "Palandri", "Bagh", "Haveli", "Neelum", "Sudhanoti",
  "Athmuqam", "Chakswari", "Dadyal", "Jhelum Valley",

  // Additional Major Towns / Peri-Urban
  "Kamoke", "Muridke", "Renala Khurd", "Phool Nagar", "Pattoki",
  "Daska", "Sambrial", "Wazirabad", "Jaranwala", "Tandlianwala",
  "Gojra", "Pir Mahal", "Mian Channu", "Jahanian", "Shahdadpur",
  "Sakrand", "Kandhkot", "Rohri", "Pano Aqil", "Tando Adam",
  "Mehrabpur", "Ratodero", "Garhi Khairo", "Tangwani",
  "Thul", "Kot Diji", "Mithankot", "Yazman", "Kunri",
  "Naukot", "Samaro", "Digri", "Talat",
]

export function filterCities(query: string): string[] {
  if (!query || query.length < 1) return []
  const q = query.toLowerCase()
  return PAKISTAN_CITIES.filter(
    (city) => city.toLowerCase().startsWith(q) || city.toLowerCase().includes(q)
  ).slice(0, 10)
}
