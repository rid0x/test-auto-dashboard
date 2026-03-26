# Pytania do uzupelnienia

## Getprice.pl
1. **Konfigurator serwerów** — potrzebuję przejść przez konfigurator krok po kroku. Jaka jest ścieżka? (np. wybór generacji → rack/tower → RAM → dysk → koszyk)? Czy mógłbyś podać link do konfiguratora i opisać kroki?
https://getprice.pl/pl/fujitsu-rx300-s8-konfigurator-fujitsu-primergy-rx300-s8-8x-25.html
klikasz przejdz do konfiguracji i masz tam pytania rozwijasz o odpowiadasz 

np pierwszy to obudowa
<button name="0-option" class="flex items-center justify-between w-full gap-4" :class="{ 'active': active }" tabindex="0" @click="active = !active" @keydown.window.escape="active = false" aria-label="Wybierz Obudowa" aria-controls="details-0-option" :aria-expanded="active ? true : false" aria-expanded="false">
                                    <div class="grid items-start w-full grid-cols-auto-auto-1">
                                        <div class="flex justify-center items-center flex-shrink-0 border text-sm leading leading-body-m rounded h-8 w-8">
                                            1                                        </div>
                                        <label id="option-label-128399" class="label text-lg lg:text-xl leading-8 lg:leading-8 font-semibold ml-6
                                                    font-microsquare cursor-pointer text-ellipsis whitespace-nowrap overflow-hidden
                                                    required">
                                            Obudowa                                        </label>
                                                                                    <div class="status ml-4 h-8 flex items-center self-center justify-self-end" x-show="(() =&gt; {
                                                    const option = selectedOptions?.[128399];
                                                    return !!(
                                                        option &amp;&amp;
                                                        option.selections &amp;&amp;
                                                        Object.keys(option.selections).length &gt; 0
                                                    );
                                                })()">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img">
<rect width="24" height="24" rx="12" fill="#1EA66E"></rect>
<path d="M7.5 12.5L11 16L17.5 9.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
<title>accept</title></svg>
                                            </div>
                                                                            </div>
                                    <div class="h-6 w-6 bg-no-repeat bg-center bg-contain" style="background-image: url('https://getprice.pl/static/version1774361136/frontend/Theme/getprice/pl_PL/svg/plus-tab.svg')" :style="`background-image: url('${active ? 'https://getprice.pl/static/version1774361136/frontend/Theme/getprice/pl_PL/svg/minus-tab.svg' : 'https://getprice.pl/static/version1774361136/frontend/Theme/getprice/pl_PL/svg/plus-tab.svg'}')`">
                                    </div>
                                </button>


                                
po kliknieciu on sie rozwija i wtedy wybierasz pokolei opcje i lecisz dalej

2. **Czy konto l.tumiel@auroracreation.com istnieje na getprice?** (logowanie działa, więc chyba tak)
3. **Newsletter** — gdzie jest formularz newslettera? (stopka? osobna strona?)

## Willsoor.pl
1. **Czy konto l.tumiel@auroracreation.com istnieje na willsoor?** (reCAPTCHA blokuje logowanie w Playwright, nie mogę zweryfikować)
2. **Newsletter** — widzę formularz w stopce. Czy jest na osobnej stronie też?
3. **Czy da się wyłączyć reCAPTCHA na willsoor dla testów?** (blokuje logowanie i rejestrację)

## 4szpaki.pl
1. **Czy konto l.tumiel@auroracreation.com istnieje na 4szpaki?** (do sprawdzenia)
2. **Produkty** — strona produktu ma warianty z wieloma przyciskami "Dodaj". Czy to normalne? Czy jest jakiś prosty produkt bez wariantów?
3. **Newsletter** — gdzie jest?

## Pieceofcase.pl
1. **Czy konto l.tumiel@auroracreation.com istnieje na pieceofcase?**
2. **Produkt** — etui wymaga wyboru modelu telefonu. Jak działa flow: wybierasz markę → model → kolor → koszyk? Czy mogę przetestować bez wyboru modelu?
3. **Newsletter** — gdzie jest?

## Moncredo.pl (Mon Credo - perfumeria)
1. **Czy konto l.tumiel@auroracreation.com istnieje na moncredo?**
2. **Jaki produkt użyć do testów?** (jakiś tani perfum/próbka?)
3. **Jaka kategoria do testów?** (np. /perfumy-damskie?)
4. **Newsletter** — gdzie jest?

## Ogólne
1. **Czy na któryś z projektów jest staging/testowe środowisko?** (bez reCAPTCHA, bez realnych zamówień)
2. **Czy mogę bezpiecznie przejść przez checkout (bez składania zamówienia)?** — chcę przetestować formularz wysyłki bez finalizacji
3. **Czy masz dostęp do Magento Admin** na którymkolwiek projekcie? (do wyłączenia reCAPTCHA, dodania testowego konta)
