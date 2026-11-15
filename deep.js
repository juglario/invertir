// The depth layer: three paragraphs per lesson, per language, rendered right
// after the lesson body as one continuous read. Together with content.js this
// targets ~20 minutes of reading. Each paragraph covers one of: the mechanism
// (why it works), a worked example with real numbers, or the limit / common
// mistake. Every figure here was recomputed in BUILDLOG.md before shipping.
// Rule for every string: no em dashes, high-school reading level.

window.DEEP = {
  inflacion: {
    es: [
      '¿Por qué suben los precios? La explicación más simple: cuando hay más plata dando vueltas que cosas para comprar, cada billete vale menos. Si un gobierno imprime billetes más rápido de lo que crece lo que el país produce, los precios suben. También pasa cuando algo que todos usan se encarece de golpe (el petróleo, por ejemplo) y ese costo se contagia a todo lo demás.',
      'Por eso los bancos centrales intentan mantener una inflación baja y estable, en general cerca de 2% por año en los países que lo logran. No apuntan a cero: una inflación chiquita y predecible se considera sana. El problema es cuando se dispara. En la Argentina, la inflación de 2023 superó el 200%. En Zimbabue, en 2008, los precios llegaron a duplicarse más o menos cada día.',
      'La idea clave para todo lo que sigue es la diferencia entre rendimiento <strong>nominal</strong> y <strong>real</strong>. Si tu plata gana 8% en un año pero la inflación fue 10%, el número creció pero tu poder de compra bajó cerca de 2%. A largo plazo lo único que importa es el rendimiento real: lo que ganás después de descontar la inflación.',
    ],
    en: [
      'Why do prices go up? The simplest explanation: when there is more money going around than things to buy, each bill is worth less. If a government prints money faster than the country produces goods, prices rise. It also happens when something everyone uses suddenly gets more expensive (oil, for example) and that cost spreads to everything else.',
      'That is why central banks try to keep inflation low and steady, usually around 2% per year in countries that manage it. They do not aim for zero: a small, predictable inflation is considered healthy. The problem is when it takes off. In Argentina, inflation in 2023 was over 200%. In Zimbabwe, in 2008, prices were doubling roughly every day.',
      'The key idea for everything that follows is the difference between <strong>nominal</strong> and <strong>real</strong> returns. If your money earns 8% in a year but inflation was 10%, the number grew but your buying power fell by about 2%. In the long run the only thing that matters is the real return: what you earn after inflation is taken out.',
    ],
    pt: [
      'Por que os preços sobem? A explicação mais simples: quando tem mais dinheiro circulando do que coisas para comprar, cada nota vale menos. Se um governo imprime dinheiro mais rápido do que cresce o que o país produz, os preços sobem. Também acontece quando algo que todo mundo usa fica mais caro de repente (o petróleo, por exemplo) e esse custo se espalha para todo o resto.',
      'Por isso os bancos centrais tentam manter a inflação baixa e estável, em geral perto de 2% ao ano nos países que conseguem. Eles não miram no zero: uma inflação pequena e previsível é considerada saudável. O problema é quando ela dispara. Na Argentina, a inflação de 2023 passou de 200%. No Zimbábue, em 2008, os preços chegaram a dobrar mais ou menos a cada dia.',
      'A ideia-chave para tudo o que vem depois é a diferença entre rendimento <strong>nominal</strong> e <strong>real</strong>. Se o seu dinheiro rende 8% em um ano, mas a inflação foi de 10%, o número cresceu, mas o seu poder de compra caiu cerca de 2%. No longo prazo, a única coisa que importa é o rendimento real: o que você ganha depois de descontar a inflação.',
    ],
  },
  colchon: {
    es: [
      '¿Por qué una deuda cara es tan peligrosa? Porque el interés compuesto, el mismo que en la lección 4 vas a ver que te hace crecer, también puede jugar en tu contra. Una deuda que no pagás crece sobre sí misma: los intereses de este mes generan intereses el mes que viene.',
      'Un ejemplo con números: si debés $100.000 a una tasa efectiva de 80% anual y no pagás nada, al año debés $180.000. Si pagás solo el mínimo de la tarjeta, la deuda puede tardar años en bajar, porque casi todo lo que pagás se va en intereses y muy poco en achicar lo que debés.',
      '¿Dónde se guarda el colchón? En algo que cumpla tres condiciones: que no pierda valor de golpe, que puedas sacarlo en uno o dos días y, si se puede, que le gane algo a la inflación. Una cuenta remunerada, un plazo fijo corto o un fondo de dinero suelen cumplirlas. Las acciones no: justo cuando hay una crisis y te quedás sin trabajo es cuando más probable es que estén bajas. El orden queda así: deudas caras primero, colchón después, inversión al final.',
      '¿Y si 3 a 6 meses no alcanza? Si tu ingreso es inestable, trabajás por tu cuenta o vivís en un país con crisis seguidas, conviene apuntar más alto: 6 meses para empezar y, con el tiempo, 1 o 2 años. No hace falta esperar a tenerlos para empezar a invertir: llegado a los 6 meses, podés repartir lo que ahorrás entre el colchón y la inversión.',
    ],
    en: [
      'Why is expensive debt so dangerous? Because compound interest, the same force you will see in lesson 4 making your money grow, can also work against you. Debt you do not pay grows on top of itself: this month\'s interest earns interest next month.',
      'An example with numbers: if you owe $5,000 at an effective 25% a year and pay nothing, after one year you owe $6,250. If you only pay the card\'s minimum, the debt can take years to shrink, because almost everything you pay goes to interest and very little goes to what you actually owe.',
      'Where do you keep the cushion? Somewhere that meets three conditions: it does not lose value suddenly, you can take it out in a day or two and, if possible, it beats inflation a little. A high-yield savings account, a short certificate of deposit or a money market fund usually qualify. Stocks do not: right when a crisis hits and you lose your job is exactly when they are most likely to be down. So the order is: expensive debt first, cushion second, investing last.',
      'What if 3 to 6 months is not enough? If your income is unstable, you work for yourself or you live in a country where crises come back to back, aim higher: 6 months to start and, over time, 1 or 2 years. You do not have to wait until you have it all to start investing: once you reach 6 months, you can split what you save between the cushion and investing.',
    ],
    pt: [
      'Por que uma dívida cara é tão perigosa? Porque os juros compostos, os mesmos que na lição 4 você vai ver fazendo o seu dinheiro crescer, também podem jogar contra você. Uma dívida que você não paga cresce em cima dela mesma: os juros deste mês geram juros no mês que vem.',
      'Um exemplo com números: se você deve R$ 10.000 a uma taxa efetiva de 80% ao ano e não paga nada, depois de um ano você deve R$ 18.000. Se você paga só o mínimo do cartão, a dívida pode levar anos para diminuir, porque quase tudo o que você paga vai para os juros e muito pouco para reduzir o que você deve.',
      'Onde guardar a reserva? Em algo que cumpra três condições: que não perca valor de repente, que você consiga sacar em um ou dois dias e, se der, que ganhe um pouco da inflação. Uma conta remunerada, um CDB com liquidez diária, o Tesouro Selic ou um fundo DI costumam cumprir. Ações não: justamente quando vem uma crise e você perde o emprego é quando é mais provável que elas estejam em baixa. A ordem fica assim: dívidas caras primeiro, reserva depois, investimento por último.',
      'E se 3 a 6 meses não forem suficientes? Se a sua renda é instável, você trabalha por conta própria ou mora em um país com uma crise atrás da outra, vale mirar mais alto: 6 meses para começar e, com o tempo, 1 ou 2 anos. Você não precisa esperar ter tudo isso para começar a investir: ao chegar aos 6 meses, pode dividir o que economiza entre a reserva e o investimento.',
    ],
  },
  ahorrar: {
    es: [
      '¿Por qué cuesta tanto ahorrar? Porque el cerebro valora mucho más algo que puede tener hoy que algo que va a tener en el futuro, aunque el premio futuro sea más grande. Los psicólogos lo llaman <strong>sesgo del presente</strong>. No es falta de voluntad, es cómo estamos hechos. Por eso los trucos que funcionan no dependen de la fuerza de voluntad: sacan la decisión del medio.',
      'La automatización funciona tan bien que se estudió a fondo. En un estudio famoso en Estados Unidos, cuando una empresa empezó a anotar automáticamente a sus empleados nuevos en el plan de ahorro para la jubilación (y el que no quería tenía que darse de baja), la participación pasó de alrededor de 4 de cada 10 a casi 9 de cada 10. Misma gente, misma plata. Lo único que cambió fue qué pasaba si no hacían nada.',
      'Otra herramienta: medir los gastos en horas de trabajo. Si ganás $5.000 por hora, unas zapatillas de $150.000 son 30 horas, casi una semana entera. No es para no gastar nunca, sino para gastar en lo que de verdad te importa y recortar sin dolor lo que no.',
    ],
    en: [
      'Why is saving so hard? Because the brain values something it can have today much more than something it will have in the future, even when the future reward is bigger. Psychologists call it <strong>present bias</strong>. It is not a lack of willpower, it is how we are wired. That is why the tricks that work do not depend on willpower: they take the decision out of the way.',
      'Automation works so well that it has been studied closely. In a famous US study, when a company started enrolling new employees in its retirement savings plan automatically (and anyone who did not want it had to opt out), participation went from about 4 in 10 to almost 9 in 10. Same people, same money. The only thing that changed was what happened if they did nothing.',
      'Another tool: measure spending in hours of work. If you earn $20 an hour, a pair of $150 sneakers is 7.5 hours, almost a full workday. The point is not to never spend, but to spend on what you really care about and cut what you do not without it hurting.',
    ],
    pt: [
      'Por que é tão difícil poupar? Porque o cérebro dá muito mais valor a algo que pode ter hoje do que a algo que vai ter no futuro, mesmo quando o prêmio futuro é maior. Os psicólogos chamam isso de <strong>viés do presente</strong>. Não é falta de força de vontade, é como a gente é feito. Por isso os truques que funcionam não dependem de força de vontade: eles tiram a decisão do caminho.',
      'A automação funciona tão bem que foi estudada a fundo. Em um estudo famoso nos Estados Unidos, quando uma empresa passou a inscrever automaticamente os funcionários novos no plano de poupança para a aposentadoria (e quem não quisesse tinha que pedir para sair), a participação foi de cerca de 4 em cada 10 para quase 9 em cada 10. Mesmas pessoas, mesmo dinheiro. A única coisa que mudou foi o que acontecia se elas não fizessem nada.',
      'Outra ferramenta: medir os gastos em horas de trabalho. Se você ganha R$ 25 por hora, um tênis de R$ 750 são 30 horas, quase uma semana inteira. A ideia não é nunca gastar, e sim gastar no que de verdade importa para você e cortar sem dor o que não importa.',
    ],
  },
  'interes-compuesto': {
    es: [
      'La mejor forma de ver el poder del tiempo es comparar a dos personas. Ana ahorra $100 por mes desde los 20 hasta los 30 y después no pone nada más: en total pone $12.000. Bruno empieza a los 30 y pone $100 por mes hasta los 65: en total pone $42.000. Con un 7% anual, a los 65 Ana tiene unos $182.600 y Bruno unos $171.100. Ana puso menos de un tercio y terminó con más. Los diez años de ventaja hicieron todo el trabajo.',
      'El interés compuesto tiene un lado oscuro que conviene entender: las <strong>comisiones</strong> también se componen. Pagar 2% por año de comisión en vez de 0,2% parece poca diferencia. Pero si ahorrás $100 por mes durante 30 años con un rendimiento de 7% antes de comisiones, esa diferencia te come más de un cuarto de lo que habrías juntado.',
      'Una advertencia: el 7% de los ejemplos es un promedio de largo plazo, no lo que pasa cada año. Hay años de +25% y años de -30%. El interés compuesto funciona a lo largo de décadas, no de meses. Si mirás un solo año, puede parecer que no funciona.',
    ],
    en: [
      'The best way to see the power of time is to compare two people. Ana saves $100 a month from age 20 to 30 and then puts in nothing more: $12,000 in total. Bruno starts at 30 and puts in $100 a month until 65: $42,000 in total. At 7% a year, at 65 Ana has about $182,600 and Bruno about $171,100. Ana put in less than a third and ended up with more. The ten-year head start did all the work.',
      'Compound interest has a dark side worth understanding: <strong>fees</strong> compound too. Paying a 2% yearly fee instead of 0.2% looks like a small difference. But if you save $100 a month for 30 years at a 7% return before fees, that difference eats more than a quarter of what you would have built.',
      'A warning: the 7% in these examples is a long-run average, not what happens every year. There are years of +25% and years of -30%. Compound interest works over decades, not months. If you look at a single year, it can seem like it is not working.',
    ],
    pt: [
      'A melhor forma de ver o poder do tempo é comparar duas pessoas. Ana guarda R$ 100 por mês dos 20 aos 30 anos e depois não coloca mais nada: no total, ela coloca R$ 12.000. Bruno começa aos 30 e coloca R$ 100 por mês até os 65: no total, ele coloca R$ 42.000. Com 7% ao ano, aos 65 Ana tem uns R$ 182.600 e Bruno uns R$ 171.100. Ana colocou menos de um terço e terminou com mais. Os dez anos de vantagem fizeram todo o trabalho.',
      'Os juros compostos têm um lado sombrio que vale a pena entender: as <strong>taxas</strong> também se compõem. Pagar 2% ao ano de taxa em vez de 0,2% parece pouca diferença. Mas se você guarda R$ 100 por mês durante 30 anos com um rendimento de 7% antes das taxas, essa diferença come mais de um quarto do que você teria juntado.',
      'Um aviso: os 7% dos exemplos são uma média de longo prazo, não o que acontece todo ano. Tem anos de +25% e anos de -30%. Os juros compostos funcionam ao longo de décadas, não de meses. Se você olhar um ano só, pode parecer que não funcionam.',
    ],
  },
  acciones: {
    es: [
      '¿Qué determina el precio de una acción? En el fondo, lo que la gente cree que la empresa va a ganar en el futuro. Si una empresa gana cada vez más plata año tras año, su acción tiende a subir con el tiempo. Pero en el día a día el precio se mueve por expectativas, noticias y el humor del mercado, y por eso puede subir o bajar mucho sin que la empresa haya cambiado nada.',
      'Una forma simple de ver si algo está caro es el <strong>P/E</strong> (precio sobre ganancias): cuántos años de ganancias actuales estás pagando. Si una acción vale $100 y la empresa gana $5 por acción por año, el P/E es 20: estás pagando 20 años de ganancias. Un P/E alto no significa que esté mal, sino que el mercado espera que la empresa crezca mucho. Si ese crecimiento no llega, el precio puede caer fuerte.',
      'El dato que más sorprende: la mayoría de las acciones individuales, a lo largo de toda su vida, rinden menos que un ahorro casi sin riesgo. Un estudio de 2018 encontró que en Estados Unidos un grupo muy chico de empresas, alrededor del 4%, explica toda la riqueza que generó la bolsa desde 1926. Elegir la acción ganadora es muy difícil, y por eso en la lección 7 vas a ver una alternativa.',
    ],
    en: [
      'What sets a stock\'s price? At bottom, what people believe the company will earn in the future. If a company makes more money year after year, its stock tends to rise over time. But day to day, the price moves on expectations, news and the market\'s mood, which is why it can rise or fall a lot without anything about the company changing.',
      'A simple way to tell if something is expensive is the <strong>P/E</strong> (price to earnings): how many years of current earnings you are paying for. If a stock costs $100 and the company earns $5 per share per year, the P/E is 20: you are paying for 20 years of earnings. A high P/E is not wrong in itself, it means the market expects the company to grow a lot. If that growth does not show up, the price can drop hard.',
      'The most surprising fact: most individual stocks, over their whole lifetime, earn less than an almost risk-free savings option. A 2018 study found that in the US a very small group of companies, about 4%, accounts for all the wealth the stock market created since 1926. Picking the winning stock is very hard, and that is why lesson 7 shows you an alternative.',
    ],
    pt: [
      'O que determina o preço de uma ação? No fundo, o que as pessoas acreditam que a empresa vai lucrar no futuro. Se uma empresa ganha cada vez mais dinheiro ano após ano, a ação dela tende a subir com o tempo. Mas no dia a dia o preço se move por expectativas, notícias e o humor do mercado, e é por isso que ele pode subir ou cair muito sem que nada tenha mudado na empresa.',
      'Um jeito simples de ver se algo está caro é o <strong>P/L</strong> (preço sobre lucro): quantos anos de lucro atual você está pagando. Se uma ação custa R$ 100 e a empresa lucra R$ 5 por ação por ano, o P/L é 20: você está pagando 20 anos de lucro. Um P/L alto não quer dizer que esteja errado, e sim que o mercado espera que a empresa cresça muito. Se esse crescimento não vier, o preço pode cair forte.',
      'O dado que mais surpreende: a maioria das ações individuais, ao longo de toda a vida delas, rende menos do que uma aplicação quase sem risco. Um estudo de 2018 descobriu que, nos Estados Unidos, um grupo bem pequeno de empresas, cerca de 4%, explica toda a riqueza que a bolsa gerou desde 1926. Escolher a ação vencedora é muito difícil, e por isso na lição 7 você vai ver uma alternativa.',
    ],
  },
  bonos: {
    es: [
      'Los bonos tienen una regla que confunde a todos al principio: <strong>cuando las tasas de interés suben, el precio de los bonos que ya existen baja</strong>. ¿Por qué? Imaginá que compraste un bono que paga 3% por año. Al mes siguiente salen bonos nuevos que pagan 5%. Nadie va a querer tu bono de 3% al mismo precio, así que si lo querés vender vas a tener que hacerlo más barato.',
      'Cuanto más largo es el bono (cuantos más años faltan para que te devuelvan la plata), más fuerte es ese efecto. En 2022, cuando las tasas subieron muy rápido, los bonos del gobierno de Estados Unidos a 20 años o más perdieron más de 30% de su valor. Por eso, para plata que podés necesitar pronto, conviene usar bonos cortos.',
      'Si te quedás con el bono hasta el final y el emisor paga, cobrás exactamente lo prometido, sin importar lo que haya pasado con el precio en el medio. Las calificadoras de riesgo les ponen notas a los emisores, desde AAA (lo más seguro) para abajo. Los bonos con nota baja se llaman de <strong>alto rendimiento</strong>, o en la jerga, bonos basura: pagan más porque es más probable que no paguen.',
    ],
    en: [
      'Bonds have a rule that confuses everyone at first: <strong>when interest rates go up, the price of existing bonds goes down</strong>. Why? Imagine you bought a bond that pays 3% a year. The next month, new bonds come out paying 5%. Nobody wants your 3% bond at the same price, so if you want to sell it, you will have to sell it cheaper.',
      'The longer the bond (the more years until you get your money back), the stronger that effect. In 2022, when rates rose very fast, US government bonds with 20 or more years left lost over 30% of their value. That is why, for money you might need soon, short bonds make more sense.',
      'If you hold the bond to the end and the borrower pays, you get exactly what was promised, no matter what happened to the price along the way. Rating agencies grade borrowers, from AAA (safest) on down. Low-rated bonds are called <strong>high-yield</strong>, or in the slang, junk bonds: they pay more because they are more likely not to pay.',
    ],
    pt: [
      'Os títulos têm uma regra que confunde todo mundo no começo: <strong>quando as taxas de juros sobem, o preço dos títulos que já existem cai</strong>. Por quê? Imagine que você comprou um título que paga 3% ao ano. No mês seguinte saem títulos novos pagando 5%. Ninguém vai querer o seu título de 3% pelo mesmo preço, então, se quiser vender, você vai ter que vender mais barato.',
      'Quanto mais longo o título (quanto mais anos faltam para devolverem o seu dinheiro), mais forte é esse efeito. Em 2022, quando as taxas subiram muito rápido, os títulos do governo dos Estados Unidos com 20 anos ou mais perderam mais de 30% do valor. Por isso, para dinheiro que você pode precisar logo, faz mais sentido usar títulos curtos.',
      'Se você fica com o título até o fim e o emissor paga, você recebe exatamente o que foi prometido, não importa o que tenha acontecido com o preço no meio do caminho. As agências de classificação de risco dão notas aos emissores, de AAA (o mais seguro) para baixo. Os títulos com nota baixa se chamam de <strong>alto rendimento</strong>, ou, na gíria, títulos podres: pagam mais porque é mais provável que não paguem.',
    ],
  },
  'fondos-indexados': {
    es: [
      'La razón de fondo es casi matemática. Todos los inversores juntos son el mercado, así que en promedio, antes de comisiones, ganan lo mismo que el mercado. Después de comisiones, el inversor promedio que intenta ganarle al mercado tiene que ganar menos que él. El fondo indexado se asegura el promedio y le resta casi nada.',
      'Los datos lo confirman. S&P publica todos los años un informe llamado SPIVA que mide exactamente esto, y en períodos de 15 años alrededor de 9 de cada 10 fondos que eligen acciones grandes en Estados Unidos rinden menos que su índice. No es que los profesionales sean malos: es que compiten contra otros profesionales igual de buenos, y encima cobran.',
      'Cómo elegir uno: mirá tres cosas. Qué índice sigue (cuanto más amplio, más diversificado), cuánto cobra por año (se llama <strong>expense ratio</strong>, buscá algo cerca de 0,2% o menos) y que lo administre una entidad grande y regulada. En algunos países se compran directo; en otros, a través de instrumentos locales que los replican.',
    ],
    en: [
      'The underlying reason is almost math. All investors together are the market, so on average, before fees, they earn exactly what the market earns. After fees, the average investor trying to beat the market has to earn less than it. The index fund locks in the average and takes almost nothing off the top.',
      'The data backs it up. S&P publishes a yearly report called SPIVA that measures exactly this, and over 15-year periods about 9 out of 10 US large-company stock-picking funds earn less than their index. It is not that professionals are bad: they compete against other professionals who are just as good, and they charge fees on top.',
      'How to pick one: look at three things. Which index it follows (the broader, the more diversified), how much it charges per year (called the <strong>expense ratio</strong>, look for around 0.2% or less) and that a large, regulated firm runs it. In some countries you buy them directly; in others, through local products that copy them.',
    ],
    pt: [
      'A razão de fundo é quase matemática. Todos os investidores juntos são o mercado, então, na média, antes das taxas, eles ganham o mesmo que o mercado. Depois das taxas, o investidor médio que tenta bater o mercado tem que ganhar menos que ele. O fundo de índice garante a média e tira quase nada dela.',
      'Os dados confirmam. A S&P publica todo ano um relatório chamado SPIVA que mede exatamente isso, e em períodos de 15 anos cerca de 9 em cada 10 fundos que escolhem ações de empresas grandes nos Estados Unidos rendem menos que o seu índice. Não é que os profissionais sejam ruins: é que eles competem contra outros profissionais tão bons quanto eles, e ainda cobram por isso.',
      'Como escolher um: olhe três coisas. Qual índice ele segue (quanto mais amplo, mais diversificado), quanto cobra por ano (é a <strong>taxa de administração</strong>, procure algo perto de 0,2% ou menos) e se quem administra é uma instituição grande e regulada. Em alguns países você compra direto. Em outros, por meio de produtos locais que os replicam.',
    ],
  },
  diversificar: {
    es: [
      'La palabra técnica es <strong>correlación</strong>: qué tan seguido dos inversiones se mueven juntas. Si dos cosas suben y bajan al mismo tiempo, juntarlas no te protege. Si una tiende a aguantar cuando la otra cae, combinarlas hace que el total se mueva mucho menos que cada una por separado.',
      'Eso tiene una consecuencia que suena a magia: al combinar inversiones que no se mueven juntas, el riesgo baja más de lo que baja el rendimiento esperado. Por eso a la diversificación se la llama el único almuerzo gratis de las inversiones: es de las pocas cosas que te dan algo sin pedirte nada a cambio.',
      'Dos límites importantes. Primero, en las crisis más fuertes muchas cosas que normalmente no se mueven juntas caen al mismo tiempo, porque todo el mundo vende para conseguir efectivo. Diversificar no te salva de todas las caídas: te salva de que una sola empresa o una sola mala decisión te arruine. Segundo, no se diversifica comprando cosas que no entendés.',
    ],
    en: [
      'The technical word is <strong>correlation</strong>: how often two investments move together. If two things rise and fall at the same time, combining them does not protect you. If one tends to hold up when the other falls, combining them makes the total move much less than each one alone.',
      'That has a consequence that sounds like magic: by combining investments that do not move together, risk drops more than the expected return does. That is why diversification is called the only free lunch in investing: it is one of the few things that gives you something without asking for anything back.',
      'Two important limits. First, in the worst crises many things that normally do not move together fall at the same time, because everyone sells to raise cash. Diversifying does not save you from every drop: it saves you from one company or one bad decision ruining you. Second, you do not diversify by buying things you do not understand.',
    ],
    pt: [
      'A palavra técnica é <strong>correlação</strong>: com que frequência dois investimentos se movem juntos. Se duas coisas sobem e caem ao mesmo tempo, juntar as duas não protege você. Se uma tende a aguentar quando a outra cai, combinar as duas faz o total se mexer muito menos do que cada uma separada.',
      'Isso tem uma consequência que parece mágica: ao combinar investimentos que não se movem juntos, o risco cai mais do que cai o rendimento esperado. Por isso a diversificação é chamada de único almoço grátis dos investimentos: é uma das poucas coisas que dão algo a você sem pedir nada em troca.',
      'Dois limites importantes. Primeiro, nas piores crises muitas coisas que normalmente não se movem juntas caem ao mesmo tempo, porque todo mundo vende para conseguir dinheiro vivo. Diversificar não salva você de todas as quedas: salva você de uma única empresa ou uma única decisão ruim acabar com tudo. Segundo, não se diversifica comprando coisas que você não entende.',
    ],
  },
  portafolio: {
    es: [
      '¿Por qué el reparto importa más que elegir acciones? Porque la mayor parte de cuánto sube y baja un portafolio con los años se explica por cuánto tiene en acciones, bonos y efectivo, no por qué acciones puntuales eligió. Dos personas con 80% en acciones van a vivir años muy parecidos, aunque hayan comprado fondos distintos.',
      'Un rebalanceo con números: arrancás con $10.000, 70% en acciones ($7.000) y 30% en bonos ($3.000). Las acciones suben 30% y los bonos quedan igual: ahora tenés $9.100 en acciones y $3.000 en bonos, un 75/25. Para volver a 70/30 sobre $12.100, vendés unos $630 de acciones y comprás bonos. Vendiste algo que subió y compraste algo que quedó barato, sin tener que adivinar nada.',
      'Una regla vieja para arrancar: tener en bonos un porcentaje parecido a tu edad y el resto en acciones (a los 20, 20% bonos y 80% acciones). Hoy muchos la consideran demasiado prudente porque vivimos más años, pero sirve como punto de partida para pensar. Lo que nunca sirve es cambiar el reparto cada vez que cambia el humor del mercado.',
    ],
    en: [
      'Why does the split matter more than picking stocks? Because most of how much a portfolio rises and falls over the years is explained by how much it holds in stocks, bonds and cash, not by which specific stocks it picked. Two people with 80% in stocks will live through very similar years, even if they bought different funds.',
      'A rebalance with numbers: you start with $10,000, 70% in stocks ($7,000) and 30% in bonds ($3,000). Stocks rise 30% and bonds stay flat: now you have $9,100 in stocks and $3,000 in bonds, about 75/25. To get back to 70/30 on $12,100, you sell about $630 of stocks and buy bonds. You sold something that went up and bought something that stayed cheap, without guessing anything.',
      'An old rule to get started: hold a percentage in bonds close to your age and the rest in stocks (at 20, 20% bonds and 80% stocks). Many people now see it as too cautious because we live longer, but it works as a starting point for thinking. What never works is changing the split every time the market\'s mood changes.',
    ],
    pt: [
      'Por que a divisão importa mais do que escolher ações? Porque a maior parte de quanto uma carteira sobe e cai ao longo dos anos é explicada por quanto ela tem em ações, títulos e dinheiro, e não por quais ações específicas ela escolheu. Duas pessoas com 80% em ações vão viver anos muito parecidos, mesmo que tenham comprado fundos diferentes.',
      'Um rebalanceamento com números: você começa com R$ 10.000, 70% em ações (R$ 7.000) e 30% em títulos (R$ 3.000). As ações sobem 30% e os títulos ficam iguais: agora você tem R$ 9.100 em ações e R$ 3.000 em títulos, uns 75/25. Para voltar a 70/30 sobre R$ 12.100, você vende uns R$ 630 de ações e compra títulos. Você vendeu algo que subiu e comprou algo que ficou barato, sem precisar adivinhar nada.',
      'Uma regra antiga para começar: ter em títulos uma porcentagem parecida com a sua idade e o resto em ações (aos 20, 20% em títulos e 80% em ações). Hoje muita gente acha essa regra cautelosa demais porque vivemos mais anos, mas ela serve como ponto de partida para pensar. O que nunca serve é mudar a divisão toda vez que muda o humor do mercado.',
    ],
  },
  emociones: {
    es: [
      'La trampa más fuerte se llama <strong>aversión a la pérdida</strong>: perder $100 duele más o menos el doble de lo que alegra ganar $100. Por eso una caída del 20% se siente como una catástrofe, aunque el año anterior hayas ganado 30%. Daniel Kahneman y Amos Tversky, los psicólogos que lo estudiaron, mostraron que le pasa a casi todo el mundo, y Kahneman ganó un Nobel en parte por eso.',
      'El costo se puede medir. Los estudios de Morningstar comparan lo que gana un fondo con lo que ganan, en promedio, las personas que invierten en ese mismo fondo. Las personas suelen ganar menos que el fondo que compraron, porque entran después de las subas y salen después de las bajas. La diferencia ronda 1 punto por año o más, y con el interés compuesto eso se vuelve mucha plata.',
      'Otra trampa: mirar demasiado. Si chequeás tu portafolio todos los días, vas a ver pérdidas casi la mitad de las veces, aunque a largo plazo suba. Si lo mirás una vez por año, la mayoría de las veces vas a ver ganancias. Mismo portafolio, otra experiencia. Mirar menos no es pereza: es una estrategia.',
    ],
    en: [
      'The strongest trap is called <strong>loss aversion</strong>: losing $100 hurts roughly twice as much as winning $100 feels good. That is why a 20% drop feels like a disaster, even if you made 30% the year before. Daniel Kahneman and Amos Tversky, the psychologists who studied it, showed it happens to almost everyone, and Kahneman won a Nobel Prize partly for it.',
      'The cost can be measured. Morningstar studies compare what a fund earns with what the people investing in that same fund earn on average. People usually earn less than the fund they bought, because they get in after the rises and get out after the drops. The gap is around 1 percentage point a year or more, and with compound interest that turns into a lot of money.',
      'Another trap: checking too often. If you look at your portfolio every day, you will see losses almost half the time, even if it rises over the long run. If you look once a year, most of the time you will see gains. Same portfolio, different experience. Looking less is not laziness: it is a strategy.',
    ],
    pt: [
      'A armadilha mais forte se chama <strong>aversão à perda</strong>: perder R$ 100 dói mais ou menos o dobro do que alegra ganhar R$ 100. Por isso uma queda de 20% parece uma catástrofe, mesmo que no ano anterior você tenha ganhado 30%. Daniel Kahneman e Amos Tversky, os psicólogos que estudaram isso, mostraram que acontece com quase todo mundo, e Kahneman ganhou um Nobel em parte por isso.',
      'O custo pode ser medido. Os estudos da Morningstar comparam o que um fundo rende com o que ganham, em média, as pessoas que investem nesse mesmo fundo. As pessoas costumam ganhar menos do que o fundo que compraram, porque entram depois das altas e saem depois das quedas. A diferença fica em torno de 1 ponto por ano ou mais, e com os juros compostos isso vira muito dinheiro.',
      'Outra armadilha: olhar demais. Se você confere a sua carteira todo dia, vai ver perdas quase metade das vezes, mesmo que ela suba no longo prazo. Se você olha uma vez por ano, na maioria das vezes vai ver ganhos. Mesma carteira, outra experiência. Olhar menos não é preguiça: é uma estratégia.',
    ],
  },
  edad: {
    es: [
      'Un dato muestra por qué el tiempo baja el riesgo: en la historia de la bolsa de Estados Unidos, las acciones cayeron más o menos 1 de cada 4 años. Pero en períodos de 20 años seguidos, contando los dividendos, nunca terminaron con pérdidas. El pasado no garantiza el futuro, pero muestra el patrón: el riesgo de un año es alto, el de dos décadas es mucho menor.',
      'Por eso muchos planes van bajando las acciones a medida que se acerca el momento de usar la plata. Es lo que hacen los fondos con fecha objetivo: empiezan con muchas acciones y, año tras año, van pasando a bonos y efectivo. Así, una caída fuerte justo antes de usar la plata no te agarra con todo en riesgo.',
      'Y no se trata solo de la edad: también importa tu trabajo. Si tu sueldo es muy estable, podés tomar un poco más de riesgo con tus inversiones. Si tu ingreso depende mucho de cómo le va a una industria o a una empresa, conviene que tus inversiones no dependan de lo mismo, para que un mal momento no te pegue dos veces.',
    ],
    en: [
      'One fact shows why time lowers risk: across US stock market history, stocks fell in roughly 1 out of every 4 years. But over any 20-year stretch, counting dividends, they never ended with a loss. The past does not guarantee the future, but it shows the pattern: the risk over one year is high, the risk over two decades is much lower.',
      'That is why many plans lower the share of stocks as the time to use the money gets closer. Target-date funds do exactly this: they start with lots of stocks and, year after year, shift toward bonds and cash. That way a big drop right before you need the money does not catch you with everything at risk.',
      'And it is not only about age: your job matters too. If your paycheck is very stable, you can take a bit more risk with your investments. If your income depends heavily on one industry or one company, it is smart for your investments not to depend on the same thing, so a bad stretch does not hit you twice.',
    ],
    pt: [
      'Um dado mostra por que o tempo reduz o risco: na história da bolsa dos Estados Unidos, as ações caíram mais ou menos 1 a cada 4 anos. Mas em períodos de 20 anos seguidos, contando os dividendos, elas nunca terminaram no prejuízo. O passado não garante o futuro, mas mostra o padrão: o risco de um ano é alto, o de duas décadas é bem menor.',
      'Por isso muitos planos vão diminuindo as ações conforme se aproxima o momento de usar o dinheiro. É o que fazem os fundos com data-alvo: começam com muitas ações e, ano após ano, vão passando para títulos e dinheiro. Assim, uma queda forte logo antes de usar o dinheiro não pega você com tudo em risco.',
      'E não se trata só da idade: o seu trabalho também importa. Se o seu salário é bem estável, você pode correr um pouco mais de risco com os seus investimentos. Se a sua renda depende muito de como vai uma indústria ou uma empresa, é bom que os seus investimentos não dependam da mesma coisa, para que uma fase ruim não atinja você duas vezes.',
    ],
  },
  'primer-paso': {
    es: [
      'Antes de abrir la cuenta, escribí tu plan en una hoja. Tres renglones alcanzan: para qué es esta plata y cuándo la vas a usar, qué porcentaje va a acciones y a bonos, y cuánto vas a invertir por mes. Ese papel es lo que vas a releer el día que el mercado se ponga feo.',
      'Qué chequear en cualquier bróker: que esté registrado ante el regulador de tu país, cuánto cobra por operar y por mantener la cuenta, y si los fondos que te interesan están disponibles. Las comisiones chicas importan: como viste con el interés compuesto, se acumulan durante décadas.',
      'Y la señal de estafa más común, para que la reconozcas siempre: alguien que te promete ganancias altas, rápidas y seguras, te apura para que decidas ya y te pide que traigas amigos para ganar más. Si ves dos de esas cosas juntas, alejate. Las inversiones reales son aburridas, y está bien que lo sean.',
    ],
    en: [
      'Before opening the account, write your plan on one page. Three lines are enough: what this money is for and when you will use it, what percentage goes to stocks and bonds, and how much you will invest each month. That page is what you will reread the day the market gets ugly.',
      'What to check with any broker: that it is registered with your country\'s regulator, how much it charges to trade and to keep the account, and whether the funds you want are available. Small fees matter: as you saw with compound interest, they add up over decades.',
      'And the most common scam signal, so you always recognize it: someone who promises high, fast and safe returns, rushes you to decide right now and asks you to bring friends to earn more. If you see two of those together, walk away. Real investing is boring, and it is fine that it is.',
    ],
    pt: [
      'Antes de abrir a conta, escreva o seu plano em uma folha. Três linhas bastam: para que é esse dinheiro e quando você vai usá-lo, que porcentagem vai para ações e para títulos, e quanto você vai investir por mês. Esse papel é o que você vai reler no dia em que o mercado ficar feio.',
      'O que conferir em qualquer corretora: se ela é registrada no órgão regulador do seu país, quanto cobra para operar e para manter a conta, e se os fundos que interessam a você estão disponíveis. Taxas pequenas importam: como você viu com os juros compostos, elas se acumulam durante décadas.',
      'E o sinal de golpe mais comum, para você reconhecer sempre: alguém que promete ganhos altos, rápidos e seguros, apressa você para decidir agora e pede que você traga amigos para ganhar mais. Se você vir duas dessas coisas juntas, caia fora. Investimentos de verdade são chatos, e tudo bem que sejam.',
    ],
  },
};
