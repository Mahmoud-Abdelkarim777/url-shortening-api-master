// start open and close the menu 
  const navToggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const closeNav = document.getElementById('close-nav');

  // Toggle mobile navigation on menu button click
  navToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('-translate-x-full');
  });

  // Close mobile navigation on close button click
  closeNav.addEventListener('click', () => {
    mobileNav.classList.add('-translate-x-full');
  });
  // end open and close the menu 

  let input = document.getElementById('short-input');
  let btn = document.getElementById('btn');
  let origin_link = document.getElementById('origin-link');
  let items_copies = document.getElementById('items-copies');
  let shorten_link = document.getElementById('shorten-link');
  let msg = document.getElementById('msg');
  
  btn.addEventListener('click', async () => {
    const newLink = input.value.trim();
    if (!newLink) {
      // إضافة الأنماط ورسالة الخطأ
      input.classList.add("placeholder:text-red");
      input.style.outline = "2px solid red";
      msg.classList.remove("hidden");
      msg.classList.add("block", "text-red", "italic");
    
      // إزالة الأنماط ورسالة الخطأ بعد 2 ثانية
      setTimeout(() => {
        input.classList.remove("placeholder:text-red");
        input.style.outline = "none";
        msg.classList.add("hidden");
        msg.classList.remove("block", "text-red", "italic");
      }, 2000);
    
      return;
    }
  
    if (!newLink || /\s|[#&?]/.test(newLink)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `The URL cannot contain spaces or the characters #, &, or ? ⚠️`,
      });
      return; // لا تتابع تنفيذ الكود إذا كان الرابط غير صالح
    }
  
    // استرجاع جميع البيانات المخزنة في sessionStorage
    const storedData = Object.values(sessionStorage).map(item => JSON.parse(item));
  
    // التحقق إذا كان الرابط المدخل موجودًا بالفعل
    const isDuplicate = storedData.some(entry => entry.originalUrl === newLink);
  
    if (isDuplicate) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: `This URL already exists in the list! ⚠️`,
      });
      return; // إذا كان الرابط مكررًا، لا تتابع التنفيذ
    }
  
    // إذا كان الرابط صالحًا وغير مكرر، خزنه في sessionStorage
    const newEntry = { originalUrl: newLink, shortenedUrl: "shortened_url_here" };
    sessionStorage.setItem(`url-${Date.now()}`, JSON.stringify(newEntry));
    console.log("New entry");
  
    try {
      const shortenedUrl = await getShortenedUrl(newLink);
      saveLink(newLink, shortenedUrl);
      displayLinks();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Please enter a valid URL ❌ 😕`,
      });
    }
  });
  
  
  document.addEventListener("DOMContentLoaded", () => {
    displayLinks();
  });
  
  function saveLink(originalUrl, shortenedUrl) {
    let links = JSON.parse(sessionStorage.getItem('links')) || [];
    links.push({ originalUrl, shortenedUrl });
    sessionStorage.setItem('links', JSON.stringify(links));
    input.value = '';
  }
  
  function displayLinks() {
    let links = JSON.parse(sessionStorage.getItem('links')) || [];
    if (links.length > 0) {
      items_copies.style.display = 'block';
      items_copies.innerHTML = ''; // تفريغ المحتوى القديم
  
      links.forEach(link => {
        const item = `
          <div class="item flex md:flex-row mb-4 flex-col gap-4 md:items-center md:justify-between bg-white md:p-6 rounded-lg">
            <p class="p-3 md:p-0 border-b  truncate md:border-none">${link.originalUrl}</p>
            <div class="flex md:flex-row  flex-col md:items-center md:justify-between md:gap-6">
              <p class="text-cyan p-3 md:p-0 truncate">${link.shortenedUrl}</p>
              <button class="m-3 mt-0 md:m-0 px-4 py-2 rounded-lg bg-cyan hover:bg-teal-300 text-white md:w-[110px]" onclick="copyToClipboard('${link.shortenedUrl}')">Copy</button>
            </div>
          </div>
        `;
        items_copies.insertAdjacentHTML('beforeend', item);
      });
      
    } else {
      items_copies.style.display = 'none';
    }
  }
  
  async function getShortenedUrl(longUrl) {
    try {
      const response = await axios.post(
        'https://corsproxy.io/?https://cleanuri.com/api/v1/shorten',
        new URLSearchParams({ url: longUrl })
      );
      return response.data.result_url;
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Please enter a valid URL ❌ 😕`,
      });
      throw new Error(error.response ? error.response.data.error : error.message);
    }
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      const button = document.activeElement; // الحصول على الزر الذي تم النقر عليه
      // حفظ النص والخلفية الأصليين
      const originalText = button.innerText;
      const originalBackground = button.style.backgroundColor;
      // تغيير النص والخلفية
      button.innerText = 'Copied!';
      button.style.backgroundColor = 'hsl(257, 27%, 26%)'; // اللون الأخضر
      // إعادة النص والخلفية بعد ثانية
      setTimeout(() => {
        button.innerText = originalText;
        button.style.backgroundColor = originalBackground;
      }, 3000);
    });
  }