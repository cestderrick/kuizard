import Link from "next/link";

export default function Post() {
  return (
    <>
      <p>
        Tu organises un quizz pour ton mariage et tu te dis « bonne idée mais je
        ne sais pas quoi demander » ? Tu n'es pas seul. Voici une liste de{" "}
        <strong>30 idées de questions</strong> classées par thème, prêtes à
        copier-coller dans ton{" "}
        <Link href="/quizz-mariage">quizz mariage Kuizard</Link>. Adapte-les à
        ta vie de couple — plus c'est précis, plus ça rigole.
      </p>

      <h2>1. La rencontre (parfait pour démarrer en douceur)</h2>
      <ol>
        <li>Où les mariés se sont-ils rencontrés pour la première fois ?</li>
        <li>Qui a fait le premier pas ?</li>
        <li>Combien de temps avant le premier rendez-vous ?</li>
        <li>Quel film a été vu au premier rendez-vous ?</li>
        <li>Quel ami commun a joué les marieurs ?</li>
      </ol>

      <h2>2. Les anecdotes (le cœur du quizz)</h2>
      <ol start={6}>
        <li>Quelle est la pire honte du marié quand il était ado ?</li>
        <li>Quel est le surnom secret que la mariée lui donne ?</li>
        <li>Quel objet la mariée a-t-elle perdu trois fois ?</li>
        <li>
          Dans quel pays ont-ils eu leur première grosse dispute en vacances ?
        </li>
        <li>Quel plat le marié a-t-il raté lamentablement au début ?</li>
      </ol>

      <h2>3. Les goûts et habitudes</h2>
      <ol start={11}>
        <li>Quel est le plat préféré de la mariée ?</li>
        <li>Quel film peuvent-ils regarder en boucle ?</li>
        <li>Quelle est leur série Netflix favorite ?</li>
        <li>Quel groupe écoutaient-ils en boucle au début ?</li>
        <li>Quel est leur snack honteux du dimanche soir ?</li>
      </ol>

      <h2>4. Les projets et l'avenir</h2>
      <ol start={16}>
        <li>Combien d'enfants envisagent-ils ?</li>
        <li>Quel pays rêvent-ils de visiter dans les 5 ans ?</li>
        <li>Quel est leur projet de vie le plus secret ?</li>
        <li>Où s'imaginent-ils vivre à la retraite ?</li>
        <li>Quel animal de compagnie rêvent-ils d'adopter ?</li>
      </ol>

      <h2>5. Les questions « photo »</h2>
      <p>
        Tu peux ajouter une image à chaque question Kuizard. C'est typiquement
        ce qui fait le sel d'un quizz mariage : la nostalgie en image.
      </p>
      <ol start={21}>
        <li>Lequel des deux bébés sur cette photo est le marié ?</li>
        <li>
          Cette photo a été prise lors de quel voyage ? (Cancún, Rome,
          Reykjavik ?)
        </li>
        <li>Quel ami commun apparaît sur cette photo de leur première soirée ?</li>
        <li>Quel âge avaient les mariés sur cette photo de fac ?</li>
        <li>
          Dans quel pays a été prise cette photo de la demande en mariage ?
        </li>
      </ol>

      <h2>6. Les bonus rigolos pour clore</h2>
      <ol start={26}>
        <li>Quel défaut le marié refuse de reconnaître ?</li>
        <li>Quelle phrase la mariée répète sans arrêt ?</li>
        <li>Qui gagne la guerre du télécommande à la maison ?</li>
        <li>Combien de paires de chaussures la mariée pense-t-elle avoir ?</li>
        <li>
          Dans 10 ans, qui aura les cheveux blancs en premier — vote des
          invités ?
        </li>
      </ol>

      <h2>Le format gagnant : 12 à 15 questions max</h2>
      <p>
        Notre conseil après avoir vu des centaines de quizz mariage&nbsp;:{" "}
        <strong>n'en mets pas trop</strong>. 12 à 15 questions est le sweet
        spot. Au-delà, l'attention décroche entre le cocktail et le dîner.
        Mixe les niveaux de difficulté pour que les nouveaux dans la famille
        s'amusent aussi.
      </p>

      <h2>Et le classement ?</h2>
      <p>
        Avec Kuizard, le classement s'affiche en direct sur l'écran de la salle
        et sur le téléphone des joueurs. Tu peux associer un{" "}
        <strong>lot aux 3 premiers</strong> — typiquement une bouteille de vin,
        un panier gourmand, ou un objet personnalisé du couple. Pour les
        derniers, la tradition veut qu'ils paient la prochaine tournée.
      </p>

      <p>
        <Link href="/signup">Crée ton compte gratuit</Link> et personnalise ton
        quizz mariage en moins de 10 minutes. Pour aller plus loin, regarde
        aussi nos <Link href="/quizz-evjf">idées pour un EVJF</Link> ou{" "}
        <Link href="/quizz-anniversaire">un anniversaire</Link>.
      </p>
    </>
  );
}
