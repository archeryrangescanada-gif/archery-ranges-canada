/**
 * Add ~100-word SEO descriptions for Manitoba archery ranges.
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Expanded ~80-100 word SEO descriptions for all 29 Manitoba listings
const DESCRIPTIONS = [
    {
        name: "Heartland Archery",
        description: "Heartland Archery is a premier indoor archery range and professional bowhunting pro shop conveniently located in Winnipeg, Manitoba. Offering a warm, family-friendly environment, Heartland has over 25 years of experience teaching archery to enthusiasts of all skill levels. Having trained over 10,000 students and produced World Champions, the facility provides expert instruction, comprehensive archery lessons, competitive leagues, and engaging birthday party packages. Whether you're a complete beginner eager to learn target archery or an experienced bowhunter looking to tune your compound bow for the upcoming season, Heartland Archery offers top-tier equipment sales and exceptional local service."
    },
    {
        name: "Heights Outdoors and Archery Range",
        description: "Serving the Winnipeg area since 1991, Heights Outdoors and Archery Range offers a state-of-the-art indoor shooting facility and comprehensive pro shop. The expansive facility features 26 well-lit shooting lanes set at a standard 20-yard distance, making it ideal for target practice and equipment tuning year-round. Heights Outdoors welcomes archers of all skill levels, from beginners seeking professional lessons to seasoned bowhunters updating their gear. Beyond individual practice, the range hosts group events, private coaching sessions, and competitive shoots. The dedicated pro shop carries a wide selection of bows, arrows, and accessories to fully outfit any archery enthusiast."
    },
    {
        name: "Archery Manitoba Sanford Range",
        description: "The Archery Manitoba Sanford Range is a dedicated outdoor archery facility located in Sanford, Manitoba. Maintained by the provincial sports organization, this premier range is exclusively open to members and guests participating in official partner club activities, group practices, and sanctioned competitions. The expansive outdoor venue features challenging 3D archery courses and comprehensive field archery setups designed to test shooters across various distances and terrains. While not open to the general public for drop-in shooting, the Sanford Range serves as a critical local hub for competitive target archery, bowhunter training, and advancing the sport of archery throughout Manitoba."
    },
    {
        name: "Jo-Brook Outdoors",
        description: "Jo-Brook Outdoors is a highly regarded archery and outdoor sporting goods retailer situated in Brandon, Manitoba. Serving the local hunting and recreational shooting community, their fully outfitted pro shop stocks an extensive inventory of premium bows, custom arrows, broadheads, sights, releases, and essential accessories tailored for successful bowhunting. In addition to high-quality archery gear sales and expert bow tuning services, Jo-Brook Outdoors provides convenient access to both indoor and outdoor archery ranges. This allows customers to test new equipment or enjoy dedicated target practice. It is a one-stop destination for hunters and archers in the Westman region."
    },
    {
        name: "Flatlanders Archery Club",
        description: "The Flatlanders Archery Club is an active outdoor archery organization located in Sanford, Manitoba, welcoming members of all ages and shooting skill levels. Operating primarily from May through October, the club manages well-maintained 3D archery targets and field archery courses that cater to various disciplines, including compound, recurve, and traditional bowhunting practice. Flatlanders Archery Club is renowned for hosting the annual Flatlanders Archery Festival, a highly anticipated community event featuring engaging seminars, door prizes, and friendly competitions. It provides an excellent local environment for target archers and bowhunters looking to connect and improve their outdoor shooting skills."
    },
    {
        name: "Burning Arrow Archery League",
        description: "The Burning Arrow Archery League is a unique, community-focused Indigenous archery program based in Winnipeg, Manitoba. Founded by Harold J.C. Angeconeb, the program has successfully helped over 500 Indigenous youths and adults reconnect with their cultural heritage through the traditional sporting discipline of archery. The league supports a welcoming, inclusive environment for learning and provides lifetime memberships that often include comprehensive equipment packages and dedicated community training sessions. By blending traditional Indigenous teachings with structured target practice, the Burning Arrow Archery League empowers participants, builds local community strength, and promotes the positive, accessible growth of archery."
    },
    {
        name: "FortWhyte Alive",
        description: "FortWhyte Alive is a stunning urban nature preserve encompassing hundreds of acres of protected green space within Winnipeg, Manitoba. Alongside popular outdoor activities like swimming, canoeing, and hiking, the facility offers structured, family-friendly archery programs and seasonal memberships. Ideal for beginners and youth, the outdoor archery range provides a safe, scenic environment to learn traditional recurve target shooting under professional guidance. FortWhyte Alive’s commitment to environmental education and outdoor recreation makes it a fantastic local destination for families looking to experience the challenging and rewarding sport of archery while enjoying the beautiful natural landscapes of Manitoba."
    },
    {
        name: "Robin Hood Pole Archery Club",
        description: "Established in 1929 in Winnipeg's historic St. Boniface neighborhood, the Robin Hood Pole Archery Club is a fascinating local organization dedicated to the centuries-old Belgian tradition of vertical pole archery. Rather than shooting horizontally at paper targets, members aim traditional bows at 37 specific bird targets placed atop a towering 110-foot pole. Shooting events are held on Wednesday evenings from late April to early September at Archery Park on Mission Street. This unique, active club preserves a distinct cultural sporting heritage and welcomes traditional archery enthusiasts interested in a challenging, highly specialized form of outdoor target shooting."
    },
    {
        name: "17 Wing Archery Club",
        description: "Located at CFB Winnipeg, the 17 Wing Archery Club has proudly served local military personnel and civilian archers for over 16 years. This inclusive, family-friendly club offers excellent outdoor target practice facilities and frequently hosts engaging 3D archery shoots on weekends. The club provides incredibly affordable drop-in rates for both PSP members and non-military guests, making it a highly accessible option for recreational shooting in the Winnipeg area. Whether you are tuning a compound bow for hunting season or practicing traditional recurve techniques, the 17 Wing Archery Club fosters a supportive community passionate about the sport of archery."
    },
    {
        name: "Brandon Wildlife Association",
        description: "The Brandon Wildlife Association operates a comprehensive, multi-discipline outdoor shooting facility located in Brandon, Manitoba. Local archers and bowhunters benefit from a dedicated outdoor archery bay featuring robust target butts established at varied distances ranging from 20 to 60 yards. Throughout the year, the association hosts highly anticipated events, including an indoor 3D shoot in January, an outdoor 3D shoot in June, and an extensive walk-around 3D course during the lush summer months. This active community club is perfect for Western Manitoba shooters seeking a well-equipped, safe environment for target practice, bow tuning, and engaging tournament play."
    },
    {
        name: "Asessippi Archery Club",
        description: "The Asessippi Archery Club is a dedicated community archery organization located in Rossburn, Manitoba. Proudly affiliated with Archery Manitoba, the club serves local enthusiasts looking to safely practice target shooting and prepare for bowhunting seasons. The club focuses on fostering a strong, supportive environment for outdoor recreation, welcoming archers of various ages and skill levels across the Parkland region. By providing local access to organized archery events and target practice, the Asessippi Archery Club plays a vital role in promoting rural sporting traditions, improving members' marksmanship, and expanding the ongoing popularity of archery in western Manitoba."
    },
    {
        name: "Bows Broads & Bullseyes Archery Club",
        description: "The Bows Broads & Bullseyes Archery Club is an empowering, women-only archery organization founded in Winnipeg, Manitoba in 2013. The club meets every second Friday evening from October to May, utilizing the excellent 26-lane, 20-yard indoor range facility provided by Heights Outdoors on Portage Avenue. Members enthusiastically practice with compound, recurve, and traditional bows (excluding crossbows) in a highly supportive, pressure-free local environment. Requiring an Archery Manitoba membership, the club is deeply dedicated to advancing female participation in the sport, offering ongoing skill development, camaraderie, and accessible indoor target practice during the cold Winnipeg winter months."
    },
    {
        name: "Fort La Bosse Wildlife",
        description: "The Fort La Bosse Wildlife Association is an active conservation and shooting sports organization located in Virden, Manitoba. The facility provides excellent archery amenities, including a 20-meter indoor range for winter practice and expansive outdoor targets stretching up to 80 yards for long-distance training. Well-regarded within the provincial archery community, the club proudly hosted the Manitoba Provincial 3D Championships in 2019 and 2020 at the scenic Eternal Springs Park. It is a premier destination for local Virden bowhunters and target archers requiring professional-grade indoor and outdoor facilities to refine their competitive marksmanship and essential hunting skills."
    },
    {
        name: "Grassland Recreation",
        description: "Grassland Recreation offers an organized community archery program serving the residents of Hartney, Manitoba, and surrounding areas. Supported by the local Grassland Recreation Commission, the program provides accessible outdoor target shooting experiences designed to introduce youth and adults to the fundamentals of archery. Operating under a supportive community framework, the program encourages active outdoor lifestyles, teaches essential range safety, and focuses on basic marksmanship development. It functions as a welcoming entry point for rural Manitoba residents eager to learn archery, build confidence, and connect with fellow target shooting enthusiasts in a structured, friendly local environment."
    },
    {
        name: "Interlake Archers",
        description: "Interlake Archers is a prominent outdoor archery club serving the vibrant Interlake region from their base in Argyle, Manitoba. Dedicated to competitive precision shooting and realistic bowhunting practice, the club boasts challenging 3D tracking courses and comprehensive field archery setups. Interlake Archers frequently hosts officially sanctioned 720 Round competitions that operate as vital Provincial Team Qualifiers. By maintaining high-quality outdoor targets and organizing structured events, the club attracts dedicated compound, recurve, and traditional archers looking for professional-tier practice facilities, tournament experiences, and a welcoming community dedicated to advancing local marksmanship and advanced archery skills in Manitoba."
    },
    {
        name: "Minnedosa Archery Club",
        description: "The Minnedosa Archery Club provides a welcoming community organization for target shooting enthusiasts in the Strathclair and Minnedosa areas of Manitoba. Operating as a proudly affiliated member of Archery Manitoba, the club emphasizes the safe, structured promotion of local archery and bowhunter preparation. The club organizes outdoor target practice and offers a supportive environment where archers can gather to share techniques, improve their accuracy, and enjoy the sport. Serving the rural Westman region, the Minnedosa Archery Club is essential for connecting passionate shooters and preserving the rich outdoor hunting and recreational archery traditions found throughout local Manitoba communities."
    },
    {
        name: "Northstar Archers",
        description: "Northstar Archers is an active, vibrant archery club based in The Pas, providing excellent sporting opportunities for Northern Manitoba. Officially affiliated with Archery Manitoba, the club is famous for organizing large-scale, highly competitive outdoor 3D archery tournaments set against the breathtaking backdrop of the Clearwater Lake area. These extensive outdoor courses challenge bowhunters and target archers with realistic, varied terrain, perfect for evaluating gear and refining crucial marksmanship skills. Northstar Archers serves as the premier community hub for Northern Manitoba residents passionate about target shooting, competitive 3D events, and responsible, ethical bowhunter training and education."
    },
    {
        name: "Prairie Bowhunters",
        description: "Prairie Bowhunters is an established archery and bowhunting club located in Portage La Prairie, Manitoba. Understanding the need for winter practice, the club meets indoors on Tuesday evenings from December through March at the Central Plains RecPlex gymnasium, allowing members to keep their skills sharp year-round. When the weather warms, Prairie Bowhunters hosts a highly anticipated annual outdoor 3D archery event near the community of Haywood. Serving local hunters and recreational shooters alike, this active club provides a fantastic environment for tuning compound bows, practicing traditional target archery, and enjoying the camaraderie of the Portage La Prairie sporting community."
    },
    {
        name: "Roblin Archery Club",
        description: "The Roblin Archery Club is a community-focused outdoor shooting organization proudly serving the municipality of Roblin, Manitoba, and the surrounding Parkland region. With official ties to Archery Manitoba, the club organizes engaging local events and provides an accessible destination for residents wanting to enjoy the precision sport of archery. Whether training for the upcoming bowhunting season or simply seeking fun recreational target practice, members benefit from a supportive rural community that prioritizes safety and fundamental skill development. The Roblin Archery Club effectively champions the growth of outdoor sporting traditions throughout the beautiful, rugged landscapes of Western Manitoba."
    },
    {
        name: "Selkirk Archers & Bowhunters",
        description: "Selkirk Archers & Bowhunters is a dedicated, non-profit community club serving target shooters and hunters in Selkirk, Manitoba. Providing versatile year-round access, the club utilizes a convenient indoor range at Harvester Outdoors during the winter and maintains an expansive outdoor target range in East Selkirk for warmer months. Club membership uniquely includes valuable liability insurance, ensuring a safe, professionally managed environment. Welcoming all bow types, the club hosts regular Thursday evening and Sunday afternoon shoots, making it the premier local destination for archers seeking consistent practice, equipment tuning, and friendly target competition just north of Winnipeg."
    },
    {
        name: "Shilo Archery Club",
        description: "Situated at CFB Shilo, approximately 35 kilometers east of Brandon, the Shilo Archery Club is an excellent local organization affiliated with Archery Manitoba. The club is proudly open to Canadian Armed Forces members, respected Veterans, and their civilian families. Known for organizing highly competitive, provincially sanctioned outdoor 3D archery tournaments, the club features engaging courses that challenge both experienced bowhunters and recreational target shooters. With a strong commitment to marksmanship, community building, and outdoor recreation, the Shilo Archery Club offers premier facilities and a welcoming environment for all archery enthusiasts living in and around the military base."
    },
    {
        name: "Smokin' X's Archery Club",
        description: "Smokin' X's Archery Club offers a specialized indoor environment for dedicated target shooters located in Winnipeg, Manitoba. Emphasizing precision marksmanship and competitive indoor archery, the club provides a consistently controlled local setting where archers can thoroughly test their equipment, perfect detailed form, and systematically prepare for local or provincial tournaments. By focusing specifically on indoor target practice, the club effectively serves the needs of Winnipeg's urban archery community, offering a warm, reliable shooting venue during Manitoba's long winter months. Smokin' X's is an excellent destination for shooters passionate about hitting the exact center of the standard target."
    },
    {
        name: "Snake Creek Wildlife",
        description: "Founded in 1970, the Snake Creek Sportsman Association in Birtle, Manitoba, boasts strong community roots with approximately 100 active members. Proudly affiliated with the Manitoba Wildlife Federation, the club supports a variety of outdoor activities including both indoor and outdoor archery shoots, traditional trap shooting, and engaging family cookouts. By offering comprehensive target facilities for local archers, the association provides a vital space for ethical bowhunter preparation and exciting recreational shooting. Snake Creek Wildlife is highly dedicated to local conservation efforts and provides an excellent, family-friendly sporting environment for the residents of Birtle and neighboring rural communities."
    },
    {
        name: "South Mountain Archery Shooters & Hunters (SMASH)",
        description: "The South Mountain Archery Shooters & Hunters (SMASH) is a highly prominent archery and hunting club located in Erickson, Manitoba. Renowned within the regional sporting community, SMASH proudly hosted the massive 2017 Manitoba Provincial 3D Championships. The club organizes challenging outdoor 3D courses designed to accurately mimic dynamic bowhunting scenarios, providing an essential practice ground for local hunters. During major shooting events, the club generously provides free camping for eager participants, fostering a welcoming, festival-like atmosphere. SMASH is an outstanding destination for archers demanding high-quality, realistic outdoor target setups right in the striking heart of Western Manitoba."
    },
    {
        name: "St. Sebastian Pole Archery",
        description: "Founded in 1926, the St. Sebastian Pole Archery club actively preserves a deeply unique piece of Manitoba's cultural heritage. Located at Archery Park on Mission Street in Winnipeg's historic St. Boniface neighborhood, the club rigorously practices the demanding, centuries-old Belgian tradition of vertical pole archery. Utilizing traditional bows, dedicated archers aim skyward at specific wooden bird targets mounted high atop a vertical mast. Sharing their specialized local outdoor grounds with the Robin Hood Pole Archery Club, St. Sebastian offers an incredibly rare, highly challenging variation of target shooting that celebrates the fascinating history of the local francophone community."
    },
    {
        name: "St. Sebastianette Archery Club",
        description: "The St. Sebastianette Archery Club is a specialized ladies' pole archery organization established in 1975 in Winnipeg, Manitoba. Embracing local heritage, the club actively continues the unique Belgian tradition of horizontal pole archery within the historic St. Boniface community on Provencher Boulevard. Utilizing traditional archery equipment, female archers of all varying skill levels aim specifically at wooden bird targets during weekly shoots held throughout the outdoor season. St. Sebastianette offers a highly inclusive, supportive local environment that allows women to connect socially while passionately preserving a fascinating, globally rare form of traditional competitive target archery."
    },
    {
        name: "Swan Valley Archery Club",
        description: "The Swan Valley Archery Club serves the beautiful, rugged Swan Valley region of Manitoba, officially operating out of the community of Bowsman, situated entirely just 16 kilometers north of Swan River. Providing essential local access to organized outdoor target shooting, the community club supports local residents who are actively preparing for the intense fall bowhunting season or simply looking to enjoy fun, structured recreational marksmanship. The Swan Valley Archery Club plays a highly critical role in maintaining safe outdoor sporting traditions and fostering healthy community engagement among passionate bowhunters and target archers living throughout the expansive Northern Parkland district."
    },
    {
        name: "Thompson Archers",
        description: "Thompson Archers is an active, vibrant indoor club serving the enthusiastic local sporting community of Thompson in Northern Manitoba. Meeting inside the spacious Trojan Gym located at Arty Parker Collegiate, the structured club provides a reliable, climate-controlled 18-meter (20-yard) archery range perfectly suited for the region's long winters. Highly dedicated to competitive growth, the club frequently trains for and actively competes in the prestigious Manitoba Winter Games. Welcoming youth and adults utilizing all bow types, Thompson Archers offers the absolute best local venue for safely learning fundamental marksmanship, advanced target tuning, and ongoing competitive shooting practice."
    },
    {
        name: "Winnipeg River Archers",
        description: "The Winnipeg River Archers club is an excellent outdoor sporting organization based in the scenic Powerview-Pine Falls area, roughly 130 kilometers northeast of the city of Winnipeg. Embracing the extensive natural beauty of the nearby Winnipeg River, the community club provides highly accessible local opportunities for outdoor target shooting and essential bowhunter practice. Catering to various ages and distinct shooting skill levels, the club fosters an appreciative, supportive environment for learning safe arrow handling and equipment setup. The Winnipeg River Archers are fully dedicated to expanding the popular outdoor recreation of archery throughout eastern rural Manitoba."
    }
];

async function main() {
    console.log('📝 Updating SEO descriptions for Manitoba...');

    let updated = 0;
    let errors = [];

    for (const { name, description } of DESCRIPTIONS) {
        const { data, error } = await supabase
            .from('ranges')
            .update({ description })
            .ilike('name', name)
            .select('id, name');

        if (error) {
            console.log(`❌ ${name}: ${error.message}`);
            errors.push(name);
        } else if (data && data.length > 0) {
            console.log(`✅ ${data[0].name} (${description.split(' ').length} words)`);
            updated++;
        } else {
            console.log(`⚠️ Not found: ${name}`);
            errors.push(`${name} (Not Found)`);
        }
    }

    console.log(`\n📊 Updated ${updated} of ${DESCRIPTIONS.length} descriptions.`);
    if (errors.length > 0) {
        console.log(`Errors:`, errors);
    }
}

main().then(() => process.exit(0)).catch(console.error);
