"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from "framer-motion";
import { MessageCircle, Zap, ShieldCheck, ArrowRight, MousePointer2, Sparkles, RefreshCcw, Database, Tv, AtSign, Heart, Video, HandMetal, Send, Infinity as InfinityIcon, CheckCircle2, Loader2, Plus } from "lucide-react";
import styles from "./page.module.css";

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const CountUpDynamic = () => {
   const [val, setVal] = useState(23847);
   useEffect(() => {
     const i = setInterval(() => setVal(v => v + Math.floor(Math.random() * 3)), 3000);
     return () => clearInterval(i);
   }, []);
   return <span>{val.toLocaleString()}</span>;
};

const CountUpMetric = ({ target, prefix = '', suffix = '', decimals = 0 }: { target: number, prefix?: string, suffix?: string, decimals?: number }) => {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: false, amount: 0.5 });
   const [val, setVal] = useState(0);

   useEffect(() => {
      if (isInView) {
         setVal(0);
         let current = 0;
         const inc = target / 40; 
         const interval = setInterval(() => {
            current += inc;
            if (current >= target) {
               current = target;
               clearInterval(interval);
            }
            setVal(current);
         }, 40);
         return () => clearInterval(interval);
      } else {
         setVal(0);
      }
   }, [isInView, target]);

   return <span ref={ref}>{prefix}{val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}</span>
};

const Typewriter = ({ text }: { text: string }) => {
   const [display, setDisplay] = useState('');
   useEffect(() => {
     let i = 0;
     const int = setInterval(() => {
        setDisplay(text.substr(0, i+1));
        i++;
        if (i === text.length) clearInterval(int);
     }, 100); 
     return () => clearInterval(int);
   }, [text]);
   return <span style={{color:'#fff'}}>{display}<motion.span animate={{opacity:[1,0]}} transition={{repeat:Infinity, duration:0.4}}>|</motion.span></span>;
}

const UI_Step1 = () => {
   const ref = useRef(null);
   const [step, setStep] = useState(0); 

   useEffect(() => {
       let isActive = true;
       const run = async () => {
           while(isActive) {
               setStep(0);
               await new Promise(r => setTimeout(r, 1000));
               if(!isActive) break;
               setStep(1); // Cursor hovers
               await new Promise(r => setTimeout(r, 600));
               if(!isActive) break;
               setStep(2); // Clicks
               await new Promise(r => setTimeout(r, 200));
               if(!isActive) break;
               setStep(3); // Loading
               await new Promise(r => setTimeout(r, 1500));
               if(!isActive) break;
               setStep(4); // Connected!
               await new Promise(r => setTimeout(r, 3500));
           }
       };
       run();
       return () => { isActive = false; };
   }, []);

   return (
      <div ref={ref} style={{position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', width:'100%', maxWidth:'400px'}}>
         <motion.div 
            animate={{ 
               x: step === 0 ? 120 : 0, 
               y: step === 0 ? 150 : 20, 
               scale: step === 2 ? 0.8 : 1,
               opacity: step >= 3 ? 0 : 1 
            }} 
            transition={{ duration: step === 0 ? 0 : 0.5 }}
            style={{ position:'absolute', top:'10%', right:'30%', zIndex:10 }}
         >
            <MousePointer2 size={24} fill="#fff" color="#000" />
         </motion.div>

         <div style={{position:'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width:'100%', height:'120px'}}>
            <AnimatePresence mode="wait">
               {step <= 2 ? (
                  <motion.div key="btn" initial={{opacity:0}} animate={{opacity:1, scale: step===1 ? 1.05 : step===2 ? 0.95 : 1}} exit={{opacity:0, scale:0.8}} style={{background:'#3b82f6', color:'#fff', padding:'1rem 2rem', borderRadius:'100px', fontWeight:600, display:'flex', alignItems:'center', gap:'0.5rem', boxShadow: step===1 ? '0 10px 20px rgba(59,130,246,0.4)': 'none', zIndex: 5}}>
                     Connect Instagram
                  </motion.div>
               ) : (
                  <motion.div key="loader" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} style={{width: 80, height: 80, borderRadius:'50%', background: step === 4 ? '#10b981' : 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 5}}>
                     {step === 3 ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{display: 'flex'}}>
                           <Loader2 size={40} color="#fff" />
                        </motion.div>
                     ) : (
                        <MessageCircle size={40} color="#fff" />
                     )}
                  </motion.div>
               )}
            </AnimatePresence>

            {step === 4 && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{position:'absolute', bottom:10, right: '35%', background:'#10b981', borderRadius:'50%', border:'3px solid #000', padding:'4px', zIndex: 6}}>
                  <CheckCircle2 size={16} color="#fff" strokeWidth={3} />
               </motion.div>
            )}
         </div>

         <div style={{textAlign:'center', height: '60px'}}>
            <div style={{fontSize:'1.2rem', fontWeight:600, color:'#fff'}}>{step <= 2 ? 'Connect with Meta' : step === 3 ? 'Authenticating...' : 'Instagram Connected'}</div>
            <div style={{fontSize:'0.9rem', color: step === 4 ? '#10b981' : '#888'}}>{step <= 2 ? '1-click secure connect' : step === 3 ? 'Talking to Meta API' : 'Active & Listening'}</div>
         </div>
      </div>
   );
};

const UI_Step2 = () => {
   const ref = useRef(null);
   const [step, setStep] = useState(0);

   useEffect(() => {
       let isActive = true;
       const run = async () => {
          while (isActive) {
             setStep(0);
             await new Promise(r => setTimeout(r, 1000));
             if(!isActive) break;
             setStep(1); // Typing pricing
             await new Promise(r => setTimeout(r, 1500));
             if(!isActive) break;
             setStep(2); // Badge pricing
             await new Promise(r => setTimeout(r, 800));
             if(!isActive) break;
             setStep(3); // Typing link
             await new Promise(r => setTimeout(r, 1500));
             if(!isActive) break;
             setStep(4); // Badge link
             await new Promise(r => setTimeout(r, 600));
             if(!isActive) break;
             setStep(5); // Complete
             await new Promise(r => setTimeout(r, 4000));
          }
       };
       run();
       return () => { isActive = false; };
   }, []);

   return (
      <div ref={ref} style={{width:'100%', maxWidth:'400px', display:'flex', flexDirection:'column', gap:'1.5rem'}}>
         <div style={{background:'#16181D', border:'1px solid #2A2D35', borderRadius:'12px', padding:'1.5rem'}}>
            <div style={{fontSize:'0.85rem', color:'#888', marginBottom:'0.5rem'}}>If User comments any of these words:</div>
            
            <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', minHeight: '34px', alignItems: 'center', marginBottom:'1rem'}}>
               <AnimatePresence>
                  {step >= 2 && (
                     <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{background:'rgba(59,130,246,0.2)', color:'#3b82f6', border:'1px solid rgba(59,130,246,0.3)', padding:'0.4rem 1rem', borderRadius:'100px', fontSize:'0.85rem'}}>pricing</motion.div>
                  )}
                  {step >= 4 && (
                     <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{background:'rgba(59,130,246,0.2)', color:'#3b82f6', border:'1px solid rgba(59,130,246,0.3)', padding:'0.4rem 1rem', borderRadius:'100px', fontSize:'0.85rem'}}>link</motion.div>
                  )}
               </AnimatePresence>
            </div>

            <div style={{background:'#0a0a0a', border:'1px solid #333', padding:'0.75rem 1rem', borderRadius:'8px', fontSize:'0.9rem', color:'#888', display:'flex', alignItems:'center', height:'45px'}}>
               <Plus size={14} style={{marginRight: '0.5rem'}}/> 
               {step === 1 ? <Typewriter text="pricing" /> : 
                step === 3 ? <Typewriter text="link" /> : 
                step >= 5 ? <span style={{opacity:0.5}}>Add keyword...</span> :
                <span style={{opacity:0.5}}>Add keyword...<motion.span animate={{opacity:[1,0]}} transition={{repeat:Infinity, duration:0.4}}>|</motion.span></span>}
            </div>
         </div>
         <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
            <motion.div animate={{ color: step >= 5 ? "#10b981" : "#666", x: step >= 5 ? [0, 5, 0] : 0 }} transition={{ repeat: step >= 5 ? Infinity : 0, duration: 1 }}>
               <ArrowRight size={20} color="inherit" />
            </motion.div>
            <motion.div animate={{ borderColor: step >= 5 ? "#10b981" : "#2A2D35" }} style={{background:'#18201D', border:'1px solid #2A2D35', borderRadius:'12px', padding:'1rem', flex:1, display:'flex', alignItems:'center', gap:'1rem', transition: 'border-color 0.5s'}}>
               <motion.div animate={{ scale: step >= 5 ? [1, 1.2, 1] : 1 }} transition={{ repeat: step >= 5 ? Infinity : 0, duration: 2 }}>
                  <Send size={20} color={step >= 5 ? "#10b981" : "#666"} style={{ transition: 'color 0.5s' }} />
               </motion.div>
               <div style={{fontSize:'0.9rem', color: step >= 5 ? '#dedede' : '#888', fontWeight: 600, transition: 'color 0.5s'}}>Send Private Message</div>
            </motion.div>
         </div>
      </div>
   );
};

const UI_Step3 = () => {
   const ref = useRef(null);
   const [step, setStep] = useState(0);

   useEffect(() => {
       let isActive = true;
       const run = async () => {
          while (isActive) {
             setStep(0);
             await new Promise(r => setTimeout(r, 1000));
             if(!isActive) break;
             setStep(1); // Trigger graph and count up
             await new Promise(r => setTimeout(r, 6000));
          }
       };
       run();
       return () => { isActive = false; };
   }, []);

   return (
      <div ref={ref} style={{width:'100%', maxWidth:'400px', display:'flex', flexDirection:'column', gap:'1.5rem'}}>
         <div style={{background:'#16181D', border:'1px solid #2A2D35', borderRadius:'16px', padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
               <div style={{fontSize:'0.85rem', color:'#888', marginBottom:'0.25rem'}}>Captured Revenue</div>
               <div style={{fontSize:'2.5rem', fontWeight:800, color: step >= 1 ? '#10b981' : '#444', transition: 'color 0.5s'}}>${step >= 1 ? <CountUpMetric target={6420} /> : "0"}</div>
            </div>
            <div style={{width:60, height:45, display:'flex', alignItems:'flex-end', gap:'4px'}}>
               <motion.div animate={{ height: step >= 1 ? '40%' : '10%' }} transition={{ duration: 0.5 }} style={{width:12, background:'#10b981', borderRadius:'4px', opacity:0.3}} />
               <motion.div animate={{ height: step >= 1 ? '60%' : '10%' }} transition={{ duration: 0.5, delay: 0.1 }} style={{width:12, background:'#10b981', borderRadius:'4px', opacity:0.5}} />
               <motion.div animate={{ height: step >= 1 ? '80%' : '10%' }} transition={{ duration: 0.5, delay: 0.2 }} style={{width:12, background:'#10b981', borderRadius:'4px', opacity:0.8}} />
               <motion.div animate={{ height: step >= 1 ? '100%' : '10%' }} transition={{ duration: 0.5, delay: 0.3 }} style={{width:12, background:'#10b981', borderRadius:'4px'}} />
            </div>
         </div>
         
         <div style={{display:'flex', gap:'1rem'}}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: step >= 1 ? 0 : 20, opacity: step >= 1 ? 1 : 0 }} transition={{ delay: 0.4 }} style={{background:'#16181D', border:'1px solid #2A2D35', borderRadius:'100px', padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'0.75rem', flex:1, justifyContent:'center'}}>
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{width:10, height:10, borderRadius:'50%', background:'#3b82f6'}} />
               <div style={{fontSize:'0.95rem', color:'#dedede', fontWeight:600}}>{step >= 1 ? <CountUpMetric target={14.2} suffix="k DMs" decimals={1} /> : "0k DMs"}</div>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: step >= 1 ? 0 : 20, opacity: step >= 1 ? 1 : 0 }} transition={{ delay: 0.5 }} style={{background:'#16181D', border:'1px solid #2A2D35', borderRadius:'100px', padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'0.75rem', flex:1, justifyContent:'center'}}>
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} style={{width:10, height:10, borderRadius:'50%', background:'#10b981'}} />
               <div style={{fontSize:'0.95rem', color:'#dedede', fontWeight:600}}>{step >= 1 ? <CountUpMetric target={12.5} suffix="% CTR" decimals={1} /> : "0% CTR"}</div>
            </motion.div>
         </div>
      </div>
   );
};

const HowItWorksInteractive = () => {
   return (
      <div className={styles.container}>
         <FadeIn><h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '6rem', color: '#fff', textAlign: 'center' }}>How it works</h2></FadeIn>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>
            
            {/* Step 1 */}
            <motion.div initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true, margin:"-10%"}} transition={{duration:0.8}} style={{ display: 'flex', flexDirection: 'row', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <FadeIn>
                     <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem' }}>Step 1</div>
                     <h3 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', color: '#fff', fontWeight: 700, lineHeight: 1.1 }}>Connect securely</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.15rem' }}>OAuth directly into Meta's official API node. No passwords required, strictly compliant.</p>
                  </FadeIn>
               </div>
               <div style={{ flex: 1, minWidth: '300px', background: 'radial-gradient(ellipse at center, #111 0%, #000 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '3rem', display: 'flex', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minHeight: '350px', alignItems: 'center' }}>
                  <motion.div initial={{opacity:0, scale:0.95}} whileInView={{opacity:1, scale:1}} viewport={{ margin: "-10%" }} transition={{duration:0.6}} style={{width:'100%', display:'flex', justifyContent:'center'}}>
                     <UI_Step1 />
                  </motion.div>
               </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true, margin:"-10%"}} transition={{duration:0.8}} style={{ display: 'flex', flexDirection: 'row-reverse', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <FadeIn delay={0.1}>
                     <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem' }}>Step 2</div>
                     <h3 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', color: '#fff', fontWeight: 700, lineHeight: 1.1 }}>Train the triggers</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.15rem' }}>Deploy keywords specific to your newest Reel or Static Post instantly from the dashboard.</p>
                  </FadeIn>
               </div>
               <div style={{ flex: 1, minWidth: '300px', background: 'radial-gradient(ellipse at center, #111 0%, #000 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '3rem', display: 'flex', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minHeight: '350px', alignItems: 'center' }}>
                  <motion.div initial={{opacity:0, scale:0.95}} whileInView={{opacity:1, scale:1}} viewport={{ margin: "-10%" }} transition={{duration:0.6}} style={{width:'100%', display:'flex', justifyContent:'center'}}>
                     <UI_Step2 />
                  </motion.div>
               </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true, margin:"-10%"}} transition={{duration:0.8}} style={{ display: 'flex', flexDirection: 'row', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <FadeIn delay={0.2}>
                     <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem' }}>Step 3</div>
                     <h3 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', color: '#fff', fontWeight: 700, lineHeight: 1.1 }}>Capture revenue</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.15rem' }}>Autodrop routes inbound requests 24/7 capturing core analytics live in your CRM.</p>
                  </FadeIn>
               </div>
               <div style={{ flex: 1, minWidth: '300px', background: 'radial-gradient(ellipse at center, #111 0%, #000 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '3rem', display: 'flex', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minHeight: '350px', alignItems: 'center' }}>
                  <motion.div initial={{opacity:0, scale:0.95}} whileInView={{opacity:1, scale:1}} viewport={{ margin: "-10%" }} transition={{duration:0.6}} style={{width:'100%', display:'flex', justifyContent:'center'}}>
                     <UI_Step3 />
                  </motion.div>
               </div>
            </motion.div>

         </div>
      </div>
   );
};

const useCases = [
    {
       avatar: 'linear-gradient(45deg, #f09433, #dc2743)',
       handle: '@tech_gadgets',
       postPrefix: 'New desk setup! Comment ',
       trigger: 'DESK',
       postSuffix: ' for the full parts list.',
       dm: 'Sent! 📦 Check out the desk setup parts here: drop.link/desk'
    },
    {
       avatar: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
       handle: '@finance_coach',
       postPrefix: 'Paying too much tax? Comment ',
       trigger: 'TAX',
       postSuffix: ' to get my free 2026 cheat sheet.',
       dm: 'Here is your cheat sheet! 📄 Download: drop.link/tax-pdf'
    },
    {
       avatar: 'linear-gradient(45deg, #ec4899, #f43f5e)',
       handle: '@style_by_sarah',
       postPrefix: 'In love with this spring dress! Comment ',
       trigger: 'OUTFIT',
       postSuffix: ' for the exact links ✨',
       dm: 'Sent the exact links to your DMs! 👗 drop.link/spring'
    },
    {
       avatar: 'linear-gradient(45deg, #10b981, #3b82f6)',
       handle: '@vegan_eats',
       postPrefix: '15-minute healthy pasta! Comment ',
       trigger: 'RECIPE',
       postSuffix: " and I'll DM you the ingredients.",
       dm: 'Here is the recipe! 🥦 Enjoy your pasta: drop.link/pasta'
    },
    {
       avatar: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
       handle: '@mr_math',
       postPrefix: 'Struggling with calculus? Comment ',
       trigger: 'STUDY',
       postSuffix: " and I'll send my free prep guide.",
       dm: 'Ace that test! 📚 Here is the prep guide: drop.link/calc'
    }
];

const HeroUseCases = () => {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const int = setInterval(() => {
            setIdx(i => (i + 1) % useCases.length);
        }, 5000); // 5 seconds per case
        return () => clearInterval(int);
    }, []);

    const current = useCases[idx];

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Ambient volumetric glow */}
            <div style={{position: 'absolute', width: '90%', height: '90%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0}} />
            
            <AnimatePresence mode="wait">
               <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
                  style={{ width: '380px', background: '#111318', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 1, display: 'flex', flexDirection: 'column' }}
               >
                   {/* IG Post Header Mockup */}
                   <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem'}}>
                      <div style={{width: 44, height: 44, borderRadius: '50%', background: current.avatar, flexShrink: 0}}/>
                      <div>
                         <div style={{fontWeight: 700, fontSize:'1rem', color:'#fff'}}>{current.handle}</div>
                         <div style={{fontSize:'0.75rem', color:'#888'}}>Just now • Instagram</div>
                      </div>
                   </div>

                   {/* IG Post Caption */}
                   <p style={{color:'#e5e7eb', fontSize:'0.95rem', lineHeight:1.5, marginBottom:'1.5rem'}}>
                      {current.postPrefix}
                      <span style={{color: '#3b82f6', fontWeight:700}}>&apos;{current.trigger}&apos;</span>
                      {current.postSuffix}
                   </p>

                   {/* Simulated Trigger Comment */}
                   <div style={{display:'flex', alignItems:'center', gap:'1rem', padding:'0.75rem', background:'rgba(255,255,255,0.02)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.05)', marginBottom:'1.5rem'}}>
                      <MessageCircle size={20} color="#888" />
                      <span style={{fontSize:'0.9rem', color:'#888', flex:1}}>Add a comment...</span>
                      <motion.div 
                         initial={{scale: 1}} animate={{scale: [1, 1.1, 1]}} transition={{repeat:Infinity, duration:2, repeatDelay: 1}}
                         style={{fontSize:'0.85rem', fontWeight:600, color:'#3b82f6', background:'rgba(59,130,246,0.1)', padding:'0.2rem 0.5rem', borderRadius:'6px'}}
                      >
                         {current.trigger}
                      </motion.div>
                   </div>

                   {/* DM Reply Box popping up */}
                   <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.8, type: 'spring', bounce: 0.4 }}
                      style={{background:'linear-gradient(145deg, #181a20, #0a0a0a)', padding:'1.25rem', borderRadius:'16px', border:'1px solid rgba(16,185,129,0.3)', position:'relative'}}
                   >
                      <div style={{position:'absolute', top:'-8px', right:'-8px', background:'#111318', borderRadius:'50%', padding: '2px'}}>
                         <div style={{background:'#10b981', width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '10px'}}>
                            ✓
                         </div>
                      </div>
                      <div style={{fontSize:'0.75rem', color:'#10b981', fontWeight:700, marginBottom:'0.5rem', letterSpacing:'0.05em', textTransform:'uppercase'}}>DM Instant Reply</div>
                      <div style={{color:'#fff', fontSize:'0.9rem', lineHeight:1.5}}>
                         {current.dm}
                      </div>
                   </motion.div>
               </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default function LandingClient({ userId }: { userId: string | null }) {
  // Cursor tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const updateMousePos = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePos);
    return () => window.removeEventListener("mousemove", updateMousePos);
  }, []);

  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <main className={styles.main}>
      {/* Premium Cursor Glow */}
      <motion.div 
        animate={{ x: mousePosition.x - 250, y: mousePosition.y - 250 }}
        transition={{ type: "tween", ease: "linear", duration: 0 }}
        style={{
           position: 'fixed', top: 0, left: 0, width: 500, height: 500,
           background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)',
           pointerEvents: 'none', zIndex: 9999, borderRadius: '50%'
        }}
      />

      <div className={styles.navbarWrapper}>
        <nav className={styles.navbar}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className={styles.logo}>
              <MessageCircle className={styles.logoIcon} style={{ color: 'var(--primary)' }} /> Autodrop
            </div>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink} onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
            <a href="#how-it-works" className={styles.navLink} onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How it Works</a>
            <a href="/pricing" className={styles.navLink}>Pricing</a>
            <Link href="/support" className={styles.navLink}>Book a Call</Link>
          </div>
          <div className={styles.authCol}>
            {userId ? (
               <Link href="/dashboard" className="premium-btn" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>Dashboard</Link>
            ) : (
               <Link href="/sign-in" className="premium-btn" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>Sign In</Link>
            )}
          </div>
        </nav>
      </div>

      <section className={styles.heroSection} style={{ padding: '8rem 0 4rem 0' }}>
        {/* Floating Top-Right Badge */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
           style={{ position: 'absolute', top: '100px', right: '5%', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', zIndex: 10, color: '#e5e7eb' }}>
           <Zap size={14} color="#facc15" fill="#facc15" /> Real-time Instagram Automation
        </motion.div>

        <div className={styles.container}>
          <div className={`${styles.heroGrid} ${styles.splitSection}`}>
            <div className={styles.heroContent}>
              <FadeIn>
                <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '100px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                   ✨ Autodrop v1 Stable
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' }}>
                  Turn Instagram Comments into Leads — <br/> <span className="text-gradient">Automatically</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '90%' }}>
                  Reply to every comment, send DMs instantly, and capture leads while you sleep. Built for creators scaling past 100k followers.
                </p>
                <div style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Zap size={16} color="#10b981" /> <CountUpDynamic /> DMs transmitted successfully today
                </div>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {userId ? (
                     <Link href="/dashboard" className="premium-btn" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>Dashboard <ArrowRight size={20}/></Link>
                  ) : (
                     <Link href="/sign-up" className="premium-btn" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>Start Free Trial <ArrowRight size={20}/></Link>
                  )}
                  <a href="#how-it-works" className={styles.navLink} onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: '#fff', fontWeight: 600, padding: '1rem 2rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', borderRadius: '999px', transition: 'all 0.2s', textDecoration: 'none' }}>See How it Works</a>
                </div>
              </FadeIn>
              <FadeIn delay={0.4}>
                <div style={{ marginTop: '2rem', border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'space-between', maxWidth: '600px' }}>
                   <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Badged Partner</div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>Autodrop is a Meta Business Partner</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Offering peace of mind by ensuring complete compliance with automation standards across Instagram.</p>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                      <InfinityIcon size={36} color="#3b82f6" strokeWidth={2.5} />
                      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>Meta Business<span style={{fontWeight: 400}}>Partners</span></span>
                   </div>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.4}>
              <div style={{ position: 'relative', height: '550px', perspective: '1000px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
                <motion.div 
                   animate={{ rotateY: [-5, 5, -5], rotateX: [2, -2, 2], y: [0, -10, 0] }} 
                   transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                   style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 5, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   
                   <HeroUseCases />

                </motion.div>

                {/* Layer 1: IG Comments Bubbles */}
                <motion.div 
                   animate={{ y: [100, -200], opacity: [0, 1, 0] }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   style={{ position: 'absolute', left: '-30px', bottom: '0', background: 'linear-gradient(135deg, #e1306c, #fd1d1d)', padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 0', fontSize: '0.85rem', fontWeight: 600, color: '#fff', zIndex: 2, boxShadow: '0 10px 30px rgba(225,48,108,0.3)' }}>
                   &quot;Send me the link! 😍&quot;
                </motion.div>
                <motion.div 
                   animate={{ y: [150, -150], opacity: [0, 1, 0] }} 
                   transition={{ duration: 4.5, delay: 1.5, repeat: Infinity, ease: "linear" }}
                   style={{ position: 'absolute', right: '-10px', bottom: '20%', background: 'linear-gradient(135deg, #e1306c, #fd1d1d)', padding: '0.75rem 1rem', borderRadius: '16px 16px 0 16px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', zIndex: 2, boxShadow: '0 10px 30px rgba(225,48,108,0.3)' }}>
                   &quot;price pls&quot;
                </motion.div>

                {/* Layer 3: DM Popup */}
                <motion.div
                   animate={{ scale: [0.8, 1, 0.8], opacity: [0, 1, 0], y: [-20, -40, -20] }}
                   transition={{ duration: 3, delay: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="glass-panel"
                   style={{ position: 'absolute', top: '10%', right: '-60px', padding: '1rem', zIndex: 6, width: '260px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)'}}/>
                      <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>DM Delivered</span>
                   </div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&quot;Here is your exclusive link: https://drop.site 🚀&quot;</div>
                </motion.div>

              </div>
            </FadeIn>
          </div>
        </div>
      </section>


      {/* Advanced 8-Grid Features Section */}
      <section id="features" style={{ padding: '8rem 0' }}>
        <div className={styles.container}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>Unlock the full Power of Instagram</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>A complete toolkit designed to harvest leads predictably without triggering ban limits.</p>
            </div>
          </FadeIn>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
             
             {/* 1. Comment Automation */}
             <FadeIn delay={0.1}>
               <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                 {/* CSS Art area */}
                 <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative' }}>
                    <div style={{ textAlign: 'center', color: '#000', fontWeight: 600, fontSize: '0.8rem', marginBottom: '1rem' }}>Comments</div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#f9fafb', padding: '1rem', borderRadius: '12px' }}>
                       <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ff77a9', flexShrink: 0 }} />
                       <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000' }}>User <span style={{ color: '#888', fontWeight: 400, marginLeft: '0.25rem' }}>2 min</span></div>
                          <div style={{ fontSize: '0.9rem', color: '#333', marginTop: '0.25rem' }}>Do you ship in Italy?</div>
                          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem', fontWeight: 600 }}>Reply</div>
                       </div>
                       <Heart size={14} color="#ff3040" fill="#ff3040" style={{ marginLeft: 'auto' }} />
                    </div>
                    {/* Auto Reply bubble */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginLeft: '2rem', marginTop: '0.5rem' }}>
                       <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6366F1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={12} color="#fff" /></div>
                       <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#000' }}>autodrop <span style={{ color: '#888', fontWeight: 400, marginLeft: '0.25rem' }}>now</span></div>
                          <div style={{ fontSize: '0.85rem', color: '#333', marginTop: '0.25rem' }}>We ship in all Europe!</div>
                       </div>
                    </div>
                 </div>
                 {/* Text Area */}
                 <div style={{ padding: '1.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Comment Automation</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Reply to comments and send a DM to engage your followers.</p>
                 </div>
               </motion.div>
             </FadeIn>

             {/* 2. Story Automation */}
             <FadeIn delay={0.2}>
               <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ background: '#0a0a0a', height: '220px', padding: '1.5rem', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: 120, height: 160, background: '#222', borderRadius: '16px', overflow: 'hidden' }}>
                       <div style={{ position: 'absolute', top: 10, left: 10, width: 30, height: 30, borderRadius: '50%', border: '2px solid #e1306c', background: '#444' }} />
                       <div style={{ position: 'absolute', bottom: 10, left: '5%', width: '90%', background: '#000', borderRadius: '100px', display: 'flex', padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#888', justifyContent: 'space-between' }}>
                          Message... <div style={{display:'flex', gap:'0.25rem'}}><span>❤️</span><span>🔥</span></div>
                       </div>
                    </div>
                    <div style={{ position: 'absolute', right: '15%', top: '35%', fontSize: '2rem' }}>🔥</div>
                    <div style={{ position: 'absolute', left: '10%', bottom: '25%', background:'rgba(255,255,255,0.9)', color:'#000', padding:'0.5rem', borderRadius:'12px', fontSize:'0.8rem', fontWeight:600 }}>React with 🔥 for tickets!</div>
                 </div>
                 <div style={{ padding: '1.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Story Automation</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Auto respond to story replies and reactions.</p>
                 </div>
               </motion.div>
             </FadeIn>

             {/* 3. Live Automation */}
             <FadeIn delay={0.3}>
               <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ background: '#161616', height: '220px', padding: '1.5rem', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#666' }} />
                          <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>live_stream</span>
                       </div>
                       <div style={{ background: '#e1306c', color: '#fff', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>LIVE</div>
                    </div>
                    {/* Live chat gradient background */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }} />
                    <div style={{ position: 'absolute', bottom: '1.5rem', left: '1rem', right: '1rem' }}>
                       <div style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '0.5rem' }}><span style={{fontWeight:600}}>fan_1</span> How much?</div>
                       <div style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '0.5rem' }}><span style={{fontWeight:600}}>fan_2</span> link pls</div>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', backdropFilter: 'blur(10px)' }}>
                          <span style={{fontSize: '0.75rem', color: '#aaa', marginLeft: '0.5rem'}}>Comment...</span>
                          <Send size={14} color="#fff" style={{marginRight: '0.5rem'}}/>
                       </div>
                    </div>
                 </div>
                 <div style={{ padding: '1.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Live Automation</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Send a message to followers who are active during lives.</p>
                 </div>
               </motion.div>
             </FadeIn>

             {/* 4. DM Automation */}
             <FadeIn delay={0.4}>
               <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', height: '100%' }}>
                       <div style={{ background: '#f3f4f6', padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 4px', fontSize: '0.85rem', color: '#000', alignSelf: 'flex-start', maxWidth: '80%' }}>Hey! I love your page!</div>
                       <div style={{ background: '#3b82f6', padding: '0.75rem 1rem', borderRadius: '16px 16px 4px 16px', fontSize: '0.85rem', color: '#fff', alignSelf: 'flex-end', maxWidth: '80%' }}>Thank you so much, it means a lot! <br/><br/>Here is a special gift link.</div>
                       <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '100px', padding: '0.5rem 1rem', marginTop: 'auto' }}>
                          <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Message...</span>
                       </div>
                    </div>
                 </div>
                 <div style={{ padding: '1.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>DM Automation</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Automatically reply to the followers who messages you.</p>
                 </div>
               </motion.div>
             </FadeIn>

             {/* 5. Ask For Follow */}
             <FadeIn delay={0.5}>
               <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', height: '100%' }}>
                       <div style={{ background: '#3b82f6', padding: '0.75rem 1rem', borderRadius: '16px 16px 4px 16px', fontSize: '0.85rem', color: '#fff', alignSelf: 'flex-end' }}>Please follow me to unlock the link.</div>
                       <div style={{ background: '#f3f4f6', padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 4px', fontSize: '0.85rem', color: '#000', alignSelf: 'flex-start', display:'flex', gap:'0.5rem', alignItems:'center' }}>I Followed <ShieldCheck size={14} color="#10b981" /></div>
                       <div style={{ background: '#3b82f6', padding: '0.75rem 1rem', borderRadius: '16px 16px 4px 16px', fontSize: '0.85rem', color: '#fff', alignSelf: 'flex-end', textAlign: 'center' }}>Thanks! Here is the link 👇<br/><div style={{background:'rgba(255,255,255,0.2)', padding:'0.4rem', borderRadius:'6px', marginTop:'0.5rem', fontWeight:600}}>Click Here</div></div>
                    </div>
                 </div>
                 <div style={{ padding: '1.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Ask For Follow</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Ask users to follow you before sending the message.</p>
                 </div>
               </motion.div>
             </FadeIn>

             {/* 6. Re-trigger */}
             <FadeIn delay={0.6}>
               <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: '#000', display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
                       <RefreshCcw size={64} color="#3b82f6" />
                       <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>Re-Trigger</span>
                    </div>
                 </div>
                 <div style={{ padding: '1.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Re-trigger</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Re-trigger automations for old posts and never loose customers.</p>
                 </div>
               </motion.div>
             </FadeIn>

             {/* 7. Collect User Data */}
             <FadeIn delay={0.7}>
               <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', height: '100%' }}>
                       <div style={{ background: '#3b82f6', padding: '0.75rem 1rem', borderRadius: '16px 16px 4px 16px', fontSize: '0.85rem', color: '#fff', alignSelf: 'flex-end', textAlign: 'center' }}>Please Share Your Email!</div>
                       <div style={{ background: '#f3f4f6', padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 4px', fontSize: '0.85rem', color: '#000', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          user@gmail.com
                       </div>
                       <div style={{ background: '#3b82f6', padding: '0.75rem 1rem', borderRadius: '16px 16px 4px 16px', fontSize: '0.85rem', color: '#fff', alignSelf: 'flex-end', textAlign: 'center' }}>Sent on Mail 📥</div>
                    </div>
                 </div>
                 <div style={{ padding: '1.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Collect User Data</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Create your email list to re-target audience.</p>
                 </div>
               </motion.div>
             </FadeIn>

             {/* 8. AI Replies Coming Soon */}
             <FadeIn delay={0.8}>
               <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <Sparkles size={40} color="#3b82f6" fill="#3b82f6" />
                       <span style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Autodrop <span style={{ color: '#3b82f6' }}>AI</span></span>
                    </div>
                 </div>
                 <div style={{ padding: '1.5rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>AI Replies <span style={{ color: '#facc15', fontSize: '0.7rem', verticalAlign: 'middle', border:'1px solid #facc15', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Coming Soon</span></h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Convert more users with the help of AI built specifically for Instagram DM sales.</p>
                 </div>
               </motion.div>
             </FadeIn>

          </div>
        </div>
      </section>


      {/* Sticky Section Trick for How it works */}
      <section id="how-it-works" style={{ padding: '8rem 0', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
         <HowItWorksInteractive />
      </section>

      <section style={{ padding: '10rem 0', textAlign: 'center' }}>
        <div className={styles.container}>
          <FadeIn>
             <h2 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: '#fff' }}>Ready to Scale?</h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>Join the 10,000+ creators literally saving 15 hours a week manually answering DMs.</p>
             {userId ? (
                <Link href="/dashboard" className="premium-btn" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>Dashboard</Link>
             ) : (
                <Link href="/sign-up" className="premium-btn" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>Start Free Trial</Link>
             )}
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 0 1.5rem', background: 'var(--surface)' }}>
        <div className={styles.container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          {/* Logo + Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MessageCircle size={28} color="var(--primary)" />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(90deg, #6366F1, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Autodrop</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', opacity: 0.7 }}>Instagram DM Automation, Simplified.</p>
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</Link>
            <Link href="/pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/support" style={{ color: 'inherit', textDecoration: 'none' }}>Support</Link>
            <span style={{ opacity: 0.5 }}>Terms &amp; Privacy</span>
          </div>

          {/* Gradient Divider */}
          <div style={{ width: '100%', maxWidth: '400px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

          {/* Copyright + Small Text */}
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.5, lineHeight: 1.6 }}>
            <p>&copy; {new Date().getFullYear()} Autodrop. All rights reserved.</p>
            <p>Not affiliated with Meta or Instagram.</p>
          </div>
        </div>

        {/* GIANT BACKGROUND WATERMARK */}
        <div style={{ width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', marginTop: '2rem', pointerEvents: 'none', userSelect: 'none' }}>
          <span style={{ fontSize: 'min(24vw, 300px)', fontWeight: 900, lineHeight: 0.75, letterSpacing: '-0.06em', background: 'linear-gradient(180deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>
            Autodrop
          </span>
        </div>
      </footer>
    </main>
  );
}
