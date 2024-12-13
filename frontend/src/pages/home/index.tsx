import { useEffect, useState } from 'react';
import { Leaves, HomeSmile, BrightnessHigh, TelephoneCall, Envelope } from "@mynaui/icons-react";
import homeImage from '@/assets/home-image.jpg';
import apartmentScreenhostOne from '@/assets/apartment-screenshot-1.png'
import homeTextBig from '@/assets/motto-big.png';
import homeTextSmall from '@/assets/motto-small.png';
import stockImageOne from '@/assets/stock-image-1.jpeg';
import stockImageTwo from '@/assets/stock-image-2.jpg';

function Home() {
  const phoneNumber = "+359 123 456 789";
  const email = "info@hometour.com";
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full h-screen relative overflow-hidden">
        <img
          src={homeImage}
          alt="sectionimage"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-1/4 h-1/4 rounded-full bg-black opacity-50 blur-2xl absolute z-0" />
            <img
              src={isSmallScreen ? homeTextSmall : homeTextBig}
              alt="sectiontext"
              className="relative w-3/4 sm:w-1/2 z-10 transform transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black opacity-70" />
        </div>

      <div className="w-full flex flex-col items-center p-8">
        <div className="flex flex-col lg:flex-row items-center justify-center mt-12 mb-12">
          <div className="flex flex-col items-center lg:items-center lg:mr-5 w-full lg:w-2/3">
            <h2 className="text-3xl font-bold text-center mt-12">
              Информация за проекта
            </h2>
            <p className="mt-4 text-lg max-w-2xl text-justify p-3">
              HomeTour цели да революционизира продажбата на недвижими имоти, предоставяйки потапящи виртуални изживявания за огледи.<br />
              Проектът прави онлайн огледите на имоти по-достъпни и ефективни за всички "посетители".<br /><br />
              С нашата иновативна платформа, компаниите, които предлагат имоти, получават уникална възможност да демонстрират обектите си по впечатляващ и достъпен начин.<br />
              Чрез нашите решения, те могат да привлекат повече клиенти и да улеснят процеса на избора, като осигурят детайлни и реалистични виртуални турове на своите обекти.<br /><br />
              Възползвайки се от мощните умения на 3D визуализацията в самия браузър на клиента, ние създаваме иновативен подход за "разходка" в недвижимите имоти.<br />
            </p>
          </div>
          <img
            src={apartmentScreenhostOne}
            alt="sectiontext"
            className="w-full max-w-[600px] lg:w-1/3 h-auto object-contain m-4 rounded-lg border shadow-lg lg:ml-12"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-center p-8">
        <div className="flex flex-col lg:flex-row items-center justify-center mb-12">
          <img
            src={stockImageTwo}
            alt="sectiontext"
            className="w-full max-w-[600px] lg:w-1/3 h-auto object-contain m-4 rounded-lg border shadow-lg lg:ml-12 mb-10"
          />
          <div className="flex flex-col items-center lg:items-center lg:ml-5 w-full lg:w-2/3">
            <h2 className="text-3xl font-bold text-center">
              Кой може да използва това?
            </h2>
            <p className="mt-4 text-lg max-w-2xl text-justify p-3">
              Нашата платформа е създадена специално за компанните, които продават <strong>недвижими имоти</strong> - строители, инвеститори и т.н., които искат да покажат своите проекти по <strong>иновативен и професионален</strong> начин пред <strong>потенциалните купувачи</strong>.<br /><br />
              Чрез нашето решение, вие получавате възможност не само да представите своите обекти, но и да ангажирате потенциалните купувачи още <strong>преди завършването на строителния процес</strong>.<br /><br />
              Като наши партньори, строителните компании получават достъп до усъвършенствани технологии, които позволяват на клиентите да се потопят във <strong>виртуална обиколка на обекта</strong>, да разгледат всеки детайл и да получат усещане за реалното пространство.<br />
              Това създава доверие и увереност, че проектът ви отговаря на техните изисквания и очаквания, като същевременно намалява нуждата от физически посещения.<br /><br />
              Когато изберете нас, вие избирате <strong>партньорство</strong>, което комбинира експертиза, технологии и специално отношение към вашите нужди.<br /><br />
              Нека заедно изградим <strong>бъдещето на недвижимите имоти</strong> и направим вашите проекти достъпни и привлекателни за купувачите на ново, професионално ниво.<br />
            </p>
          </div>
          
        </div>
      </div>

      <div className="w-full flex flex-col items-center p-8 mb-6">
        <h2 className="text-3xl font-bold flex items-center mb-6">
          Изберете нас ако..
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="flex flex-col items-center justify-center border shadow-md rounded-lg py-10 px-2 h-[500px]">
            <Leaves className="w-12 h-12" />
            <p className="text-lg max-w-2xl text-center p-4">
              Търсите <strong>иновативен и креативен начин</strong> да представите вашите проектим, които са още в етап „на зелено”. 
              Нашата платформа ви дава възможност да вдъхнете живот на идеите си, преди сградите да са завършени, чрез потапящи виртуални 
              турове, които ангажират и впечатляват.<br /><br />
            </p>
          </div>
          <div className="flex flex-col items-center justify-center border shadow-md rounded-lg py-10 px-2 h-[500px]">
            <HomeSmile className="w-12 h-12" />
            <p className="text-lg max-w-2xl text-center p-4">
              Вече разполагате с готови сгради и искате да избегнете стандартното представяне чрез обикновени снимки, ние ви 
              предлагаме <strong>по-динамичен и модерен подход</strong>, който подчертава всеки аспект на вашите обекти. С помощта 
              на нашите виртуални решения, клиентите ви могат да се „разходят“ из пространствата, да разгледат детайлите и да почувстват 
              атмосферата на мястото.<br /><br />
            </p>
          </div>
          <div className="flex flex-col items-center justify-center border shadow-md rounded-lg py-10 px-2 h-[500px]">
            <BrightnessHigh className="w-12 h-12" />
            <p className="text-lg max-w-2xl text-center p-4">
              Доверете се на нас, ако искате <strong>да разнообразите своята визия</strong> и да предоставите нещо ново и различно на 
              пазара на недвижими имоти. Нашият екип ще създаде за вас уникално изживяване, което не само представя вашите проекти по 
              най-добрия начин, но и ще остави трайно впечатление у вашите клиенти.<br /><br />
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-center p-8">
        <div className="flex flex-col lg:flex-row items-center justify-center mb-10">
          <div className="flex flex-col items-center lg:items-center lg:mr-5 w-full lg:w-2/3">
            <h2 className="text-3xl font-bold text-center mt-12">
              Как работим?
            </h2>
            <p className="mt-4 text-lg max-w-2xl text-justify p-3">
              Процесът ни на работа е лесен и съобразен с вашите нужди. <strong>Свържете се с нас</strong>, за да 
              обсъдим вашите идеи и изисквания. <br/> След това ни можете да ни предоставите <strong>плановете на 
              сградите</strong>, които искате да визуализираме. Ако желаете, можем да работим съвместно с вашия 
              екип от дизайнери, за да създадем визуализациите така, че да отразяват визията ви в най-големи детайли.<br /><br />
              По време на процеса на разработка ще имате възможност <strong>да преглеждате и коментирате</strong> 
              всяка визуализация, като предоставяте обратна връзка. Продължаваме да работим върху тях, докато сте 
              напълно доволни от крайния резултат. Когато визуализациите са готови, вие можете да ги публикувате на 
              своя уебсайт и <strong>да ги използвате свободно</strong> за привличане на клиенти и популяризиране на вашите проекти.<br /><br />
              Освен това, когато станете част от нашата партньорска мрежа, ще имате възможност да публикувате обяви 
              не само за сградите, на които сме направили визуализация, но и информация за всички ваши апартаменти, 
              които предлагате за продажба, директно на нашия сайт. По този начин вашите обекти ще достигнат до по-широка 
              аудитория, осигурявайки ви <strong>допълнителна видимост</strong> и <strong>реклама</strong> за повишаване на 
              интереса и популярността на вашите проекти.<br /><br />
              Станете наш партньор и се възползвайте от всички възможности, които нашият сайт предлага за представяне 
              на вашите проекти и достигане до нови клиенти.
            </p>
          </div>
          <img
            src={stockImageOne}
            alt="sectiontext"
            className="w-full max-w-[600px] lg:w-1/3 h-auto object-contain m-4 rounded-lg border shadow-lg lg:ml-12"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-center p-8 mb-12">
        <h2 className="text-3xl font-bold flex items-center">
          Свържете се с нас
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 w-full justify-items-center">
          <div className="flex flex-col items-center p-3 border rounded-lg shadow-md w-full max-w-[320px]">
            <h2 className="text-2xl font-semibold p-3">Телефонен номер</h2>
            <TelephoneCall className="w-12 h-12" />
            <p className="text-lg max-w-2xl text-center p-3">{phoneNumber}</p>
          </div>

          <div className="flex flex-col items-center p-3 border rounded-lg shadow-md w-full max-w-[320px]">
            <h2 className="text-2xl font-semibold p-3">Имейл</h2>
            <Envelope className="w-12 h-12" />
            <p className="text-lg max-w-2xl text-center p-3">{email}</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
