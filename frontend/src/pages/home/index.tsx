import { useEffect, useState } from 'react';
import { HttpService } from '../../services/http-service';
import { Leaves, HomeSmile, BrightnessHigh, TelephoneCall, Envelope } from "@mynaui/icons-react";
import Footer from '../../components/footer';

function Home() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [homeTextUrl, setHomeTextUrl] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    setPhoneNumber("+359 123 456 789");
    setEmail("info@hometour.com");
  }, []);

  useEffect(() => {
    const fetchImageUrl = async () => {
      const response = await HttpService.get<{ url: string }>('/get-presigned-url/to-view?key=home-image', undefined, false);
      setImageUrl(response.url);
    };
    fetchImageUrl();
  }, []);

  useEffect(() => {
    const fetchHomeTextUrl = async () => {
      const response = await HttpService.get<{ url: string }>('/get-presigned-url/to-view?key=home-text', undefined, false);
      setHomeTextUrl(response.url);
    };
    fetchHomeTextUrl();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full h-screen relative overflow-hidden">
        <img
          src={imageUrl}
          alt="sectionimage"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-1/4 h-1/4 rounded-full bg-black opacity-50 blur-2xl absolute z-0" />
          <img
            src={homeTextUrl}
            alt="sectiontext"
            className="relative w-1/2 z-10 transform transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black opacity-70" />
      </div>

      <div className="w-full flex flex-col items-center p-8 border-t border-gray-800">
        <h2 className="text-3xl font-bold flex items-center mt-12">
          Информация за проекта
        </h2>
        <div className="flex flex-row items-center justify-center mt-12">
          <p className="mt-4 text-lg max-w-2xl text-center p-3 mr-12">
            HomeTour цели да революционизира продажбата на недвижими имоти, предоставяйки потапящи виртуални изживявания за огледи.<br />
            Проектът прави онлайн огледите на имоти по-достъпни и ефективни за всички "посетители".<br /><br />
            С нашата иновативна платформа, компаниите, които предлагат имоти, получават уникална възможност да демонстрират обектите си по впечатляващ и достъпен начин.<br />
            Чрез нашите решения, те могат да привлекат повече клиенти и да улеснят процеса на избора, като осигурят детайлни и реалистични виртуални турове на своите обекти.<br /><br />
            Възползвайки се от мощните умения на 3D визуализацията в самия браузър на клиента, ние създаваме иновативен подход за "разходка" в недвижимите имоти.<br />
            </p>
          <img
            src={imageUrl}
            alt="sectiontext"
            className="w-1/3 h-auto object-contain m-4 rounded-lg border shadow-md ml-12"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-center p-8 border-t border-gray-800">
        <h2 className="text-3xl font-bold flex items-center mt-12">
          Кой може да използва това?
        </h2>
        <div className="flex flex-row items-center justify-center mr-12">
        <img
            src={imageUrl}
            alt="sectiontext"
            className="w-1/3 h-auto object-contain m-4 rounded-lg border shadow-md mr-12"
          />
          <p className="text-lg max-w-2xl text-center p-3 mt-12 ml-12">
            Нашата платформа е създадена специално за компанните, които продават <strong>недвижими имоти</strong> - строители, инвеститори и т.н., които искат да покажат своите проекти по <strong>иновативен и професионален</strong> начин пред <strong>потенциалните купувачи</strong>.<br /><br />
            Чрез нашето решение, вие получавате възможност не само да представите своите обекти, но и да ангажирате потенциалните купувачи още <strong>преди завършването на строителния процес</strong>.<br /><br />
            Като наши партньори, строителните компании получават достъп до усъвършенствани технологии, които позволяват на клиентите да се потопят във <strong>виртуална обиколка на обекта</strong>, да разгледат всеки детайл и да получат усещане за реалното пространство.<br />
            Това създава доверие и увереност, че проектът ви отговаря на техните изисквания и очаквания, като същевременно намалява нуждата от физически посещения.<br /><br />
            Когато изберете нас, вие избирате <strong>партньорство</strong>, което комбинира експертиза, технологии и специално отношение към вашите нужди.<br /><br />
            Нека заедно изградим <strong>бъдещето на недвижимите имоти</strong> и направим вашите проекти достъпни и привлекателни за купувачите на ново, професионално ниво.<br />
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col items-center p-8 border-t border-gray-800">
        <h2 className="text-3xl font-bold flex items-center mt-12">
          Изберете нас ако..
        </h2>
        <div className="flex flex-row items-center justify-center mt-3">
          <div className="flex flex-col items-center justify-center m-12">
            <Leaves className="w-12 h-12" />
            <p className="text-lg max-w-2xl text-center p-4">
              Изберете нас, ако търсите <strong>иновативен и креативен начин</strong> да представите вашите проектим, които са още в етап „на зелено”. Нашата платформа ви дава възможност да вдъхнете живот на идеите си, преди сградите да са завършени, чрез потапящи виртуални турове, които ангажират и впечатляват.<br /><br />
            </p>
          </div>
          <div className="flex flex-col items-center justify-center m-12">
            <HomeSmile className="w-12 h-12" />
            <p className="text-lg max-w-2xl text-center p-3">
              Ако вече разполагате с готови сгради и искате да избегнете стандартното представяне чрез обикновени снимки, ние ви предлагаме <strong>по-динамичен и модерен подход</strong>, който подчертава всеки аспект на вашите обекти. С помощта на нашите виртуални решения, клиентите ви могат да се „разходят“ из пространствата, да разгледат детайлите и да почувстват атмосферата на мястото.<br /><br />
            </p>
          </div>
          <div className="flex flex-col items-center justify-center m-12">
            <BrightnessHigh className="w-12 h-12" />
            <p className="text-lg max-w-2xl text-center p-3">
              Доверете се на нас, ако искате <strong>да разнообразите своята визия</strong> и да предоставите нещо ново и различно на пазара на недвижими имоти. Нашият екип ще създаде за вас уникално изживяване, което не само представя вашите проекти по най-добрия начин, но и ще остави трайно впечатление у вашите клиенти.<br /><br />
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-center p-8 border-t border-gray-800">
        <h2 className="text-3xl font-bold flex items-center mt-12">
          Как работим?
        </h2>
        <div className="flex flex-row items-center justify-center mt-12">
          <p className="text-lg max-w-2xl text-center p-3 mt-12 ml-12">
            Процесът ни на работа е лесен и съобразен с вашите нужди. <strong>Свържете се с нас</strong>, за да обсъдим вашите идеи и изисквания. <br/> След това ни можете да ни предоставите <strong>плановете на сградите</strong>, които искате да визуализираме. Ако желаете, можем да работим съвместно с вашия екип от дизайнери, за да създадем визуализациите така, че да отразяват визията ви в най-големи детайли.<br /><br />

            По време на процеса на разработка ще имате възможност <strong>да преглеждате и коментирате</strong> всяка визуализация, като предоставяте обратна връзка. Продължаваме да работим върху тях, докато сте напълно доволни от крайния резултат. Когато визуализациите са готови, вие можете да ги публикувате на своя уебсайт и <strong>да ги използвате свободно</strong> за привличане на клиенти и популяризиране на вашите проекти.<br /><br />

            Освен това, когато станете част от нашата партньорска мрежа, ще имате възможност да публикувате обяви не само за сградите, на които сме направили визуализация, но и информация за всички ваши апартаменти, които предлагате за продажба, директно на нашия сайт. По този начин вашите обекти ще достигнат до по-широка аудитория, осигурявайки ви <strong>допълнителна видимост</strong> и <strong>реклама</strong> за повишаване на интереса и популярността на вашите проекти.<br /><br />

            Станете наш партньор и се възползвайте от всички възможности, които нашият сайт предлага за представяне на вашите проекти и достигане до нови клиенти.
          </p>
          <img
            src={imageUrl}
            alt="sectiontext"
            className="w-1/3 h-auto object-contain m-4 rounded-lg border shadow-md ml-12"
          />
        </div>
      </div>

      <div className="w-full flex flex-col items-center p-8 border-t border-gray-800 mb-12">
        <h2 className="text-3xl font-bold flex items-center mt-12">
          Свържете се с нас
        </h2>
        <div className="flex flex-row items-center justify-center mt-12">
          <div className="flex flex-col items-center mr-12">
              <h2 className="text-2xl font-semibold  p-3">Телефонен номер</h2>
              <TelephoneCall className="w-12 h-12" />
              <p className="text-lg max-w-2xl text-center p-3">{phoneNumber}</p>
          </div>

          <div className="flex flex-col items-center ml-12">
              <h2 className="text-2xl font-semibold p-3">Имейл</h2>
              <Envelope className="w-12 h-12" />
              <p className="text-lg max-w-2xl text-center p-3">{email}</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
